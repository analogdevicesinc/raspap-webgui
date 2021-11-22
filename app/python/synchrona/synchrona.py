import adijif
import adidt as dt
import os
import subprocess

from fdt import Property

driver_modes = ["LVPECL", "LVPECL", "LVPECL", "LVPECL", "CMOS", "LVPECL", "CMOS", "LVDS", "LVDS", "LVDS", "LVDS", "CMOS", "LVPECL", "CMOS"]


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


def read_channel():
    d = dt.hmc7044_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo",  arch="arm")
    node = d.get_node_by_compatible("adi,hmc7044")
    node = node[0]
    pll2_fr = read_attr(node, "adi,pll2-output-frequency")
    print(pll2_fr)
    ret_dict = []
    for i in range(0, 14):
        ch_dict = dict()
        ch_node = node.get_subnode("channel@{0}".format(i))
        ch_dict["divider"] = read_attr(ch_node, "adi,divider")

        if ch_dict["divider"] == 0:
            ch_dict["enable"] = False
            ch_dict["frequency"] = 0
        else:
            ch_dict["enable"] = True
            ch_dict["frequency"] = pll2_fr // ch_dict["divider"]
        ch_dict["coarse_delay"] = read_attr(ch_node, "adi,coarse-digital-delay")
        ch_dict["fine_delay"] = read_attr(ch_node, "adi,fine-analog-delay")
        ret_dict.append(ch_dict)
    return ret_dict


def getCMOSDict(flag):
    n = flag & 0x01
    p = flag & 0x02
    return {"P": p, "N": n}


# TODO: only for revB
def get_hmc7044_priority(input_priority):
    priority = []
    ad9545_added = False
    for i in input_priority:
        if i in ["pps", "ref_in", "50mhz"] and ad9545_added is False:
            priority.append(2)
            ad9545_added = True
            continue
        if i == "tcxo":
            priority.append(3)
            continue
        if i == "ref_clk":
            priority.append(1)
            continue
    priority.append(0)
    return priority


def create_hmc7044_clock_config(config, jif_config):
    if config.vcxo == 100000000:
        jif_config["reference_frequencies"] = [25000000, 25000000, 25000000, 25000000]
    else:
        jif_config["reference_frequencies"] = [38400000, 38400000, 38400000, 38400000]

    jif_config["reference_selection_order"] = [0, 1, 2, 3] # for revA

    for i in range(1, 15):
        jif_config["output_clocks"][str(i)]["high-performance-mode-disable"] = True
        jif_config["output_clocks"][str(i)]["startup-mode-dynamic-enable"] = True
        jif_config["output_clocks"][str(i)]["dynamic-driver-enable"] = True
        jif_config["output_clocks"][str(i)]["force-mute-enable"] = True
        jif_config["output_clocks"][str(i)]["output-mux-mode"] = "CH_DIV"
        jif_config["output_clocks"][str(i)]["driver_impedances"] = "100_OHM"

        jif_config["output_clocks"][str(i)]["coarse-delay"] = config.channels[i-1].coarse_delay
        jif_config["output_clocks"][str(i)]["fine-delay"] = config.channels[i-1].fine_delay
        jif_config["output_clocks"][str(i)]["driver-mode"] = driver_modes[i - 1]
        if driver_modes[i - 1] == "CMOS":
            jif_config["output_clocks"][str(i)]["CMOS"] = getCMOSDict(config.channels[i-1].cmos)

    return jif_config


def hmc7044_config(config):
    clk = adijif.hmc7044(solver="gekko")
    output_clocks = []
    for ch in config.channels:
        output_clocks.append(ch.frequency)

    output_clocks = list(map(int, output_clocks))
    clock_names = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]
    clk.n2 = 24
    clk.vxco_doubler = 2

    clk.set_requested_clocks(config.vcxo, output_clocks, clock_names)

    try:
        clk.solve()
    except:
        try:
            if config.vcxo == 100000000:
                config.vcxo = 122880000
            else:
                config.vcxo = 100000000
            clk.set_requested_clocks(config.vcxo, output_clocks, clock_names)
            clk.solve()
        except:
            return None

    jif_config = clk.get_config()

    # force dividers to be int
    for i in range(0, 14):
        # TODO: bug
        # divider = int(0)
        # if config.channels[i].enable:
        #     divider = int(jif_config["out_dividers"][i])
        divider = int(jif_config["out_dividers"][i])
        config.channels[i].divider = divider
        jif_config["out_dividers"][i] = divider
        jif_config["output_clocks"][str(i+1)]["divider"] = divider

    jif_config = create_hmc7044_clock_config(config, jif_config)

    d = dt.hmc7044_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo",  arch="arm")
    dt_config = {"vcxo": config.vcxo, "clock": jif_config}
    node = d.get_node_by_compatible("adi,hmc7044")

    node = node[0]

    d.set_dt_node_from_config(node, dt_config)

    node = d.get_node_by_compatible("")
    n = find_node(node[0], "pin-6-vcxo-select")
    if config.vcxo == 100000000:
        if n.exist_property("output-high"):
            n.remove_property("output-high")
        if n.exist_property("bias-pull-up"):
            n.remove_property("bias-pull-up")
        if not n.exist_property("bias-pull-down"):
            n.append(Property("bias-pull-down"))
    else:
        if n.exist_property("bias-pull-down"):
            n.remove_property("bias-pull-down")
        if not n.exist_property("bias-pull-up"):
            n.append(Property("bias-pull-up"))
        if not n.exist_property("output-high"):
            n.append(Property("output-high"))

    d.write_out_dts("tmp.dts")
    recompile_dts("/boot/overlays/rpi-ad9545-hmc7044.dtbo")

    return config


def ad9545_config(config):
    clk = adijif.ad9545(solver="gekko")

    clk.avoid_min_max_PLL_rates = True
    clk.minimize_input_dividers = True

    input_refs = [(0, 1), (2, 10e6)]
    output_clocks = []
    if config.vcxo == 100000000:
        output_clocks.append((0, 25000000))
    else:
        output_clocks.append((0, 38400000))

    input_refs = list(map(lambda x: (int(x[0]), int(x[1])), input_refs))  # force to be ints
    output_clocks = list(map(lambda x: (int(x[0]), int(x[1])), output_clocks))  # force to be ints

    clk.set_requested_clocks(input_refs, output_clocks)

    clk.solve()

    jif_config = clk.get_config()
    # only for revA
    if config.input_priority[0] == "pps":
        jif_config["PLL0"]["priority_source_0"] = 5
        jif_config["PLL0"]["priority_source_2"] = 15
    else:
        jif_config["PLL0"]["priority_source_0"] = 15
        jif_config["PLL0"]["priority_source_2"] = 5

    jif_config["PLL0"]["priority_source_4"] = 25

    d = dt.ad9545_dt(dt_source="local_file", local_dt_filepath="/boot/overlays/rpi-ad9545-hmc7044.dtbo", arch="arm")
    node = d.get_node_by_compatible("adi,ad9545")

    node = node[0]
    d.set_dt_node_from_config(node, jif_config)
    d.write_out_dts("tmp.dts")
    recompile_dts("/boot/overlays/rpi-ad9545-hmc7044.dtbo")


def configure_synchrona(config):
    config = hmc7044_config(config)
    if config is None:
        return config

    ad9545_config(config)
    subprocess.call("/var/www/html/app/python/synchrona/reload_dtb.sh")
    if config.vcxo == 100000000:
        subprocess.call(["/var/www/html/app/python/synchrona/set_vcxo_pin.sh", "0"])
    else:
        subprocess.call(["/var/www/html/app/python/synchrona/set_vcxo_pin.sh", "1"])
    return config
