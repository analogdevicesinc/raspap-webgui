from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep


class Panel:
    def __init__(self, driver) -> None:
        self.driver = driver

    def debug_tab(self):
        self.driver.find_elements_by_link_text("Debug")[0].click()

    def general_tab(self):
        self.driver.find_elements_by_link_text("General")[0].click()

    def advanced_tab(self):
        self.driver.find_elements_by_link_text("Advanced")[0].click()


class GeneralPanel(Panel):
    def reload_config(self):
        self.driver.find_element_by_id("gen_btnreconfig").click()

    def select_all(self):
        self.driver.find_element_by_id("btnselectall").click()

    def deselect_all(self):
        self.driver.find_element_by_id("btnselectnone").click()

    def set_frequency(self, frequency, port, enable=True):
        if enable:
            self.driver.find_element_by_id(f"enable{port}").click()
        we = self.driver.find_element_by_id(f"frequency_ch{port}")
        we.send_keys(Keys.CONTROL, "a")
        we.send_keys(Keys.DELETE)
        we.send_keys(frequency)


class DebugPanel(Panel):
    def restart_server(self):
        self.driver.find_element_by_name("restartsynchronaserver").click()

    def restart_devicetree(self):
        self.driver.find_element_by_name("restartsynchronadt").click()


class AdvancedPanel(Panel):
    def change_reference_order(self, ref_order):

        # Get current positions
        ref_in = self.driver.find_element_by_id("ref_in")
        pps = self.driver.find_element_by_id("pps")
        ref_clk = self.driver.find_element_by_id("ref_clk")
        tcxo = self.driver.find_element_by_id("tcxo")

        los = [
            ref_in.location["y"],
            pps.location["y"],
            ref_clk.location["y"],
            tcxo.location["y"],
        ]
        los.sort()

        action = ActionChains(self.driver)
        for i, clk in enumerate(ref_order):
            wb = self.driver.find_element_by_id(clk)
            highlight(wb, 1, "blue", 5)

            target = self.driver.find_element_by_xpath(
                f"/html/body/div/div/div/div/div/div/div/div[2]/div/div[2]/div[2]/div[2]/div[4]/div[{i+1}]"
            )
            highlight(target, 1, "red", 5)

            if not wb:
                raise Exception(f"{clk} not valid")

            print(f"Moving: {clk} to {target.location}")
            action.drag_and_drop(wb, target)
            sleep(1)


def highlight(element, effect_time, color, border):
    """Highlights (blinks) a Selenium Webdriver element"""
    driver = element._parent

    def apply_style(s):
        driver.execute_script(
            "arguments[0].setAttribute('style', arguments[1]);", element, s
        )

    original_style = element.get_attribute("style")
    apply_style("border: {0}px solid {1};".format(border, color))
    sleep(effect_time)
    apply_style(original_style)
