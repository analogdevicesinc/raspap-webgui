import iio
import adijif
import adidt as dt
import os
import fdt
import subprocess
import copy
import traceback as trace

from fdt import Property

driver_modes = []
selected_usecase = "default"

class SynchronaClockError(Exception):
    pass

def get_devicetree_status():
    output_dtoverlay = os.popen('dtoverlay -l').read()
    if output_dtoverlay == 'No overlays loaded\n':
        return '0' # No dt loaded
    if compare_devicetrees() is False:
        return '1' # Current dt is not loaded
    return '2' # Dt succesfully loaded


def compare_nodes(first_node, second_node, properties):
    for first_prop in first_node.props:
        if first_prop.name in properties:
            for second_prop in second_node.props:
                if first_prop.name == second_prop.name:
                    if first_prop.value != second_prop.value:
                        return False
                    break
    return True


def compare_devicetrees():
    os.system('dtc -I fs -O dtb /sys/firmware/devicetree/base > /tmp/system_dt.dtbo')
    with open("/tmp/system_dt.dtbo", "rb") as f:
        dtb_data_file = f.read()
        dt_system = fdt.parse_dtb(dtb_data_file)
    os.popen('rm /tmp/system_dt.dtbo')

    with open("/boot/overlays/rpi-ad9545-hmc7044.dtbo", "rb") as f:
        dtb_data_file = f.read()
        dt_boot = fdt.parse_dtb(dtb_data_file)

    ad9545_node_boot = dt_boot.search('ad9545@0')[1]
    ad9545_node_system = dt_system.search('ad9545@0')[0]

    ad9545_node_properties = ['assigned-clock-rates', 'clock-names', 'adi,ref-frequency-hz']
    if compare_nodes(ad9545_node_boot, ad9545_node_system, ad9545_node_properties) is False:
        return False

    for pll_name in ['pll-clk@0', 'pll-clk@1']:
        pllclk_boot = dt_boot.search(pll_name)[0]
        pllclk_system = dt_system.search(pll_name)[0]

        for first_node in pllclk_boot.nodes:
            for second_node in pllclk_system.nodes:
                if first_node.name == second_node.name:
                    if compare_nodes(first_node, second_node, ['adi,pll-source']) is False:
                        return False
                    break

    hmc7044_node_boot = dt_boot.search('hmc7044@1')[1]
    hmc7044_node_system = dt_system.search('hmc7044@1')[0]

    hmc7044_node_properties = ['adi,pll1-clkin-frequencies', 'clock-names', 'adi,vcxo-frequency', 'adi,pll2-output-frequency', 'clock-output-names']
    hmc7044_channel_properties = ['adi,extended-name', 'adi,driver-impedance-mode', 'adi,driver-mode', 'adi,divider']

    for first_node in hmc7044_node_boot.nodes:
        for second_node in hmc7044_node_system.nodes:
            if first_node.name == second_node.name:
                if compare_nodes(first_node, second_node, hmc7044_channel_properties) is False:
                    return False
                break

    return compare_nodes(hmc7044_node_boot, hmc7044_node_system, hmc7044_node_properties)


def read_status():
    hmc_status = read_hmc7044_status()
    hmc_temp = read_hmc7044_temperature()
    pll0_status = read_debug_attr('/sys/kernel/debug/clk/PLL0/PLL0')
    pll1_status = read_debug_attr('/sys/kernel/debug/clk/PLL1/PLL1')

    refB_status = read_debug_attr('/sys/kernel/debug/clk/Ref-B-Div/Ref-B-Div')
    refBB_status = read_debug_attr('/sys/kernel/debug/clk/Ref-BB-Div/Ref-BB-Div')

    if all(el is None for el in [hmc_status, pll0_status, pll1_status, refB_status, refBB_status]) is True:
        return None

    # HMC7044 status
    split_line = '\n-------------------------------------------------------\n'
    msg = '---------------------HMC7044---------------------\n'
    if hmc_status is None:
        msg += 'No IIO interface available'
    else:
        msg += hmc_status
    msg += split_line

    # HMC7044 temperature
    if hmc_temp is None:
         msg += 'HMC7044 temperature: sensor not found' + split_line
    else:
        msg += 'HMC7044 temperature: ' + str(hmc_temp) + ' C' + split_line

    msg += '----------------------AD9545----------------------\n'

    # PLLO status
    msg += get_status_display_msg(pll0_status, 'PLL0')

    # PLL1 status
    msg += get_status_display_msg(pll1_status, 'PLL1')

    # ref B status
    msg += get_status_display_msg(refB_status, 'RefB')

    # ref BB status
    msg += get_status_display_msg(refBB_status, 'RefBB')

    return msg

def get_input_ref_status(input_ref):
    hmc_status = read_hmc7044_status()

    if hmc_status is None:
        return

    try:
         hmc7044_ref = hmc_status.split("CLKIN")[1].split(" @")[0]
    except IndexError as e:
         print("Could not get hmc7044 reference: [" + str(e) + "]")
         return

    if hmc7044_ref == "3":
        input_ref.ref = "TCXO"
    elif hmc7044_ref == "1":
        input_ref.ref = "REF_CLK"
    elif hmc7044_ref == "2":
        pll0_status = read_debug_attr('/sys/kernel/debug/clk/PLL0/PLL0')
        if pll0_status is None:
            return
        if "Freerun Mode: On" in pll0_status:
            input_ref.ref = "OCXO"
        elif "Holdover Mode: On" in pll0_status:
            input_ref.ref = "Holdover"
        elif "PLL status: Locked" in pll0_status:
            # if PLL is locked is it safe to assume that the profile is on?!
            try:
                profile = pll0_status.split("Profile Number: ")[1].split("\n")[0]
                dts = dt.dt(dt_source="local_file",
                            local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo", arch="arm")
                ad9545 = dts.get_node_by_compatible("adi,ad9545")[0]
                pll_node = ad9545.get_subnode("pll-clk@0")
                pll_profile = pll_node.get_subnode("profile@" + profile)
            except:
                print(trace.print_exc())
            else:
                pll_source = read_attr(pll_profile, "adi,pll-source")
                if pll_source == 3:
                    input_ref.ref = "PPS"
                elif pll_source == 2:
                    input_ref.ref = "REF_IN"
                # else just leave ref as "Unknown"
    else:
        # Just assume we are using CLKIN0 which should never happen
        input_ref.ref = "P_CH3"

    if "PLL1 & PLL2 Locked" in hmc_status and input_ref.ref != "Unknown":
        input_ref.locked = True

def read_hmc7044_status():
    context = iio.Context('local:')
    if context is None:
        return None
    hmc_dev = context.find_device('hmc7044')
    if hmc_dev is None:
        return None
    attr = hmc_dev.debug_attrs['status']
    return attr.value


def read_hmc7044_temperature():
    for subdir, dirs, _ in os.walk('/sys/class/hwmon'):
        for dir in dirs:
             with open(subdir + '/' + dir + '/' + "name") as name_file:
                    if name_file.read().strip() == 'adt7422':
                        with open(subdir + '/' + dir + '/' + "temp1_input") as temp_file:
                            return int(temp_file.read().strip()) / 1000


def read_debug_attr(path):
    if os.path.isfile(path) is False:
        return None
    with open(path, 'r') as f:
        msg = f.read()
    msg += '-------------------------------------------------------\n'
    return msg


def get_status_display_msg(status, name):
    split_line = '\n-------------------------------------------------------\n'
    if status is None:
        return name + ' not found' + split_line
    return status


def recompile_dts(dtb_file_path):
    os.system("rm {0}".format(dtb_file_path))
    os.system("dtc -O dtb -o {0} tmp.dts".format(dtb_file_path))
    os.system("rm tmp.dts")


def find_node(node, name):
    if node.name == name:
        return node
    for n in node.nodes:
        node_found = find_node(n, name)
        if node_found is not None:
            return node_found


def read_attr(node, attr):
    try:
        return node.get_property(attr).value
    except:
        return 0


def convert_ch_index_to_dt(i):
    ch_map = [8, 9, 10, 7, 11, 6, 13, 4, 12, 5, 0, 1, 3, 2]
    return ch_map[i]

def convert_dt_to_ch_index(i):
    ch_map = [8, 9, 10, 7, 11, 6, 13, 4, 12, 5, 0, 1, 3, 2]
    return ch_map.index(i)

def get_input_priorities(dts, hmc7044_prio):
    inputs = []

    for i in range(0, 4):
        ref = (hmc7044_prio >> (i * 2)) & 0x3
        # clkin0 is not really visible to the user and should only be used as last resort,
        # thus it should always be in priority 4 (i == 3)
        if ref == 0:
            continue
        if ref == 1 or ref == 3:
            inputs.append("ref_clk" if ref == 1 else "tcxo")
            continue

        try:
            # ad9545
            ad9545_ref = dict()
            ad9545 = dts.get_node_by_compatible("adi,ad9545")[0]
            # both pll-clk@ must be present and have the same sources and priorities. Hence, we
            # just get the first one...
            pll_node = ad9545.get_subnode("pll-clk@0")
            for p in range(0, 2):
                pll_profile = pll_node.get_subnode("profile@" + str(p))
                pll_source = read_attr(pll_profile, "adi,pll-source")
                pll_priority = read_attr(pll_profile, "adi,profile-priority")
                if pll_source != 2 and pll_source != 3:
                    # unknown source
                    break
                ad9545_ref["pps" if pll_source == 3 else "ref_in"] = pll_priority

            inputs.append("pps" if ad9545_ref["pps"] < ad9545_ref["ref_in"] else "ref_in")
            inputs.append("pps" if "pps" not in inputs else "ref_in")
        except:
             print(trace.print_exc())

    return inputs

def read_channel():
    global driver_modes
    driver_modes = []
    with open('/etc/raspap/synchrona/synchrona_ch_modes.txt', 'r') as file:
        driver_modes = [line.rstrip() for line in file]

    d = dt.hmc7044_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo",  arch="arm")
    node = d.get_node_by_compatible("adi,hmc7044")
    node = node[0]
    vcxo = read_attr(node, "adi,vcxo-frequency")
    pll2_fr = read_attr(node, "adi,pll2-output-frequency")
    hmc7044_prio = read_attr(node, "adi,pll1-ref-prio-ctrl")
    ret_dict = dict()
    channels_list =[]
    for i in range(0, 14):
        ch_dict = dict()
        ch_node = node.get_subnode("channel@{0}".format(convert_ch_index_to_dt(i)))
        ch_dict["divider"] = read_attr(ch_node, "adi,divider")

        if ch_node.exist_property("adi,disable"):
            ch_dict["enable"] = False
        else:
            ch_dict["enable"] = True
        ch_dict["frequency"] = pll2_fr // ch_dict["divider"]
        ch_dict["coarse_delay"] = read_attr(ch_node, "adi,coarse-digital-delay")
        ch_dict["fine_delay"] = read_attr(ch_node, "adi,fine-analog-delay")
        ch_dict["mode"] = driver_modes[i]
        channels_list.append(ch_dict)
    ret_dict["channels"] = channels_list
    ret_dict["vcxo"] = vcxo
    ret_dict["mode"] = selected_usecase
    ret_dict["input_priorities"] = get_input_priorities(d, hmc7044_prio)

    # check ad9545 input references status
    ret_dict["pps"] = False
    ret_dict["ref_in"] = False
    pps_ref = read_debug_attr('/sys/kernel/debug/clk/Ref-BB-Div/Ref-BB-Div')
    if pps_ref is not None and "Valid" in pps_ref:
        ret_dict["pps"] = True

    ref_in_ref = read_debug_attr('/sys/kernel/debug/clk/Ref-B-Div/Ref-B-Div')
    if ref_in_ref is not None and "Valid" in ref_in_ref:
        ret_dict["ref_in"] = True

    return ret_dict


def getCMOSDict(flag):
    n = flag & 0x01
    p = (flag & 0x02) >> 1
    return {"P": p, "N": n}


def get_hmc7044_priority(input_priority):
    priority = []
    ad9545_added = False
    for i in input_priority:
        if i in ["pps", "ref_in"] and ad9545_added is False:
            priority.append(2)
            ad9545_added = True
        elif i == "tcxo":
            priority.append(3)
        elif i == "ref_clk":
            priority.append(1)
    priority.append(0)
    return priority

# This is used to set the jif clock dictionary keys so that 'adi,extended-name' is
# properly set in the devicetree nodes. Note that the mapping between GUI and dts are
# correctly set in the tuple.
dt_list_map = (
    "HMC7044_CLKOUT0_CH11", "HMC7044_CLKOUT1_CH12", "HMC7044_CLKOUT2_CH14", "HMC7044_CLKOUT3_CH13",
    "HMC7044_CLKOUT4_CH8", "HMC7044_CLKOUT5_CH10", "HMC7044_CLKOUT6_CH6", "HMC7044_CLKOUT7_CH4",
    "HMC7044_CLKOUT8_CH1", "HMC7044_CLKOUT9_CH2", "HMC7044_CLKOUT10_CH3", "HMC7044_CLKOUT11_CH5",
    "HMC7044_CLKOUT12_CH9", "HMC7044_CLKOUT13_CH7"
)

def create_hmc7044_clock_config(config, jif_config, node):
    if config.vcxo == 100000000:
        jif_config["reference_frequencies"] = [25000000, 25000000, 25000000, 40000000]
    else:
        jif_config["reference_frequencies"] = [38400000, 38400000, 38400000, 38400000]

    jif_config["reference_selection_order"] = get_hmc7044_priority(config.input_priority)

    pll2_fr = read_attr(node, "adi,pll2-output-frequency")

    for i, key in enumerate(dt_list_map):
        # TODO: More properties to add?!

        if key not in jif_config["output_clocks"]:
            ch_node = node.get_subnode("channel@{0}".format(i))
            divider = int(read_attr(ch_node, "adi,divider"))
            jif_config["out_dividers"].insert(i, divider)
            jif_config["output_clocks"][key] = {'rate': pll2_fr // divider, 'divider': divider}
        else:
            divider = int(jif_config["out_dividers"][i])
            jif_config["out_dividers"][i] = divider
            jif_config["output_clocks"][key]["divider"] = divider

        config.channels[convert_dt_to_ch_index(i)].divider = divider

        #enable/disable fine delay
        if config.channels[i].fine_delay > 0:
            jif_config["output_clocks"][key]["output-mux-mode"] = "ANALOG_DELAY"
        else:
            jif_config["output_clocks"][key]["output-mux-mode"] = "CH_DIV"

        jif_config["output_clocks"][key]["coarse-delay"] = config.channels[i].coarse_delay
        jif_config["output_clocks"][key]["fine-delay"] = config.channels[i].fine_delay
        jif_config["output_clocks"][key]["driver-mode"] = driver_modes[convert_dt_to_ch_index(i)]
        if driver_modes[convert_dt_to_ch_index(i)] == "CMOS":
            jif_config["output_clocks"][key]["CMOS"] = getCMOSDict(config.channels[i].cmos)

    # reorder jif_config keys so the correct nodes are set
    jif_config["output_clocks"] = {k: jif_config["output_clocks"][k] for k in dt_list_map}

    return jif_config


def hmc7044_config(config):
    clk = adijif.hmc7044(solver="gekko")
    output_clocks = []
    clock_names= []

    for i, ch in enumerate(config.channels):
        if ch.enable:
            output_clocks.append(ch.frequency)
            clock_names.append(dt_list_map[i])

    output_clocks = list(map(int, output_clocks))

    clk.set_requested_clocks(config.vcxo, output_clocks, clock_names)

    try:
        clk.solve()
    except:
        try:
            if config.vcxo == 100000000:
                config.vcxo = 122880000
            else:
                config.vcxo = 100000000
            clk = adijif.hmc7044(solver="gekko")
            clk.set_requested_clocks(config.vcxo, output_clocks, clock_names)
            clk.solve()
        except Exception as e:
            raise SynchronaClockError("Invalid Frequencies: Cannot solve HMC7044 clock configuration...") from e

    jif_config = clk.get_config()

    d = dt.hmc7044_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo",  arch="arm")
    node = d.get_node_by_compatible("adi,hmc7044")
    node = node[0]

    jif_config = create_hmc7044_clock_config(config, jif_config, node)

    dt_config = {"vcxo": config.vcxo, "clock": jif_config}
    d.set_dt_node_from_config(node, dt_config)

    #enable/disable channels
    for i in range(0, 14):
        ch_node = node.get_subnode("channel@{0}".format(i))
        if config.channels[i].enable:
            if ch_node.exist_property("adi,disable"):
                ch_node.remove_property("adi,disable")
        else:
            if not ch_node.exist_property("adi,disable"):
                ch_node.append(Property("adi,disable"))

    node = d.get_node_by_compatible("")
    n = find_node(node[0], "pin-6-vcxo-select")
    if config.vcxo == 100000000:
        if n.exist_property("output-high"):
            n.remove_property("output-high")
        if n.exist_property("bias-pull-up"):
            n.remove_property("bias-pull-up")
        if not n.exist_property("bias-pull-down"):
            n.append(Property("bias-pull-down"))
        if not n.exist_property("output-low"):
            n.append(Property("output-low"))
    else:
        if n.exist_property("bias-pull-down"):
            n.remove_property("bias-pull-down")
        if n.exist_property("output-low"):
            n.remove_property("output-low")
        if not n.exist_property("bias-pull-up"):
            n.append(Property("bias-pull-up"))
        if not n.exist_property("output-high"):
            n.append(Property("output-high"))

    d.write_out_dts("tmp.dts")
    recompile_dts("/boot/overlays/rpi-ad9545-hmc7044.dtbo")

    return config


def get_ad9545_priority(input_priority):
    # source 2, 3
    priority = [0, 0]
    coef = 5
    for inp in input_priority:
        if inp == "pps":
            i = 1
        elif inp == "ref_in":
            i = 0
        else:
            continue
        priority[i] = coef
        coef += 10
    return priority


def ad9545_config(config):
    clk = adijif.ad9545(solver="gekko")

    clk.avoid_min_max_PLL_rates = True
    clk.minimize_input_dividers = True

    input_refs = [(2, 10000000), (3, 1)]
    output_clocks = [(6, 38400000)] # vcxo 122.88
    if config.vcxo == 100000000:
        output_clocks = [(6, 25000000)]

    input_refs = list(map(lambda x: (int(x[0]), int(x[1])), input_refs))  # force to be ints
    output_clocks = list(map(lambda x: (int(x[0]), int(x[1])), output_clocks))  # force to be ints

    global selected_usecase
    if config.mode == "zerodelay":
        selected_usecase = "zerodelay"
        clk.profiles = {
            "dpll_0_profile_0": {"hitless" : False, "fb_source" : 0},
            "dpll_0_profile_1": {"hitless" : False, "fb_source" : 0},
            "dpll_0_profile_2": {"hitless" : False, "fb_source" : 0},
            "dpll_0_profile_3": {"hitless" : False, "fb_source" : 0},
            "dpll_1_profile_0": {"hitless" : False, "fb_source" : 0},
            "dpll_1_profile_1": {"hitless" : False, "fb_source" : 0},
            "dpll_1_profile_2": {"hitless" : True, "fb_source" : 6},
            "dpll_1_profile_3": {"hitless" : True, "fb_source" : 6},
        }
    else:
        selected_usecase = "default"

    clk.set_requested_clocks(input_refs, output_clocks)

    try:
        clk.solve()
    except Exception as e:
        raise SynchronaClockError("Invalid Frequencies: Cannot solve AD9454 clock configuration...") from e

    jif_config = clk.get_config()

    priority = get_ad9545_priority(config.input_priority)
    plls = ["PLL0", "PLL1"]
    for ppl in plls:
        jif_config[ppl]["priority_source_2"] = priority[0]
        jif_config[ppl]["priority_source_3"] = priority[1]

    d = dt.ad9545_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo", arch="arm")
    node = d.get_node_by_compatible("adi,ad9545")

    node = node[0]
    d.set_dt_node_from_config(node, jif_config)
    d.write_out_dts("tmp.dts")
    recompile_dts("/boot/overlays/rpi-ad9545-hmc7044.dtbo")


# map displayed channels to dt order
def remap_config(config):
    tmp_channels = copy.deepcopy(config.channels)
    for i in range(0, 14):
        new_id = convert_ch_index_to_dt(i)
        config.channels[new_id] = tmp_channels[i]
        config.channels[new_id].id = new_id
    return config


def configure_synchrona(config):
    config = remap_config(config)
    config.errno_str = ""

    global driver_modes
    driver_modes = []
    with open('/etc/raspap/synchrona/synchrona_ch_modes.txt', 'r') as file:
        driver_modes = [line.rstrip() for line in file]

    try:
        hmc7044_config(config)
        ad9545_config(config)
    except SynchronaClockError as s:
        config.errno_str = str(s)
    except Exception as e:
        # even though catching such a generic exception is not usually good, in this case
        # is better to report some severe message to the user (and still print the stack trace in
        # here) rather than letting the GUI reload wheel spinning indefinitely...
        config.errno_str = "Unknown and severe error when doing hmc7044 and ad9545 configurations! \
Run 'journalctl -r -u synchrona' on the board and report the bug..."
        print(trace.print_exc())
    else:
        ret = subprocess.call("/etc/raspap/synchrona/reload_dtb.sh")
        if ret:
            config.errno_str = "Failed to reload the devicetree overlay: (ret=" + str(ret) + ")"

    return config
