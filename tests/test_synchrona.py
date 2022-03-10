import pytest
from selenium import webdriver
import sys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep

from webui_model import AdvancedPanel, GeneralPanel


@pytest.fixture
def chrome_driver():

    ip = "10.44.3.78"
    ip = f"http://admin:analog@{ip}"

    cd = webdriver.Chrome()
    cd.get(ip)
    cd.maximize_window()

    yield cd

    sleep(2)
    cd.close()


def test_lambdatest_todo_app(chrome_driver):
    sleep(1)

    gp = GeneralPanel(chrome_driver)
    ap = AdvancedPanel(chrome_driver)

    # Disable all
    gp.select_all()
    gp.set_frequency("100000", 1, True)
    sleep(1)
    gp.deselect_all()
    sleep(1)

    # Set some values
    for k in range(5):
        gp.set_frequency("100000", k + 1)
        sleep(1)

    # Toggle tabs
    gp.debug_tab()
    sleep(1)
    gp.general_tab()
    sleep(1)
    gp.debug_tab()
    sleep(1)

    ap.advanced_tab()
    # THIS IS BROKEN
    ap.change_reference_order(["ref_in", "pps", "ref_clk", "tcxo"])
