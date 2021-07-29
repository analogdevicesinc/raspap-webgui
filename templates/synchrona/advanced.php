<style>
    .synchrona_input_group {
        padding: 5px;
        border-style: solid;
        border-width: thin;
        display: none;
    }
</style>

<div class="tab-pane fade" id="synchronaadvanced">
    <h4 class="mt-3">Advanced controls</h4>
    <script type="text/javascript" src="app/js/synchrona_advanced.js"></script>
    <div class="row">
        <div class="col">
            <select id="cbxinputasd" name="Input" class="form-control" onchange="inputChanged()">
                <option value="50MHz"><?php echo _("50 MHz OCXO"); ?></option>
                <option value="1PPS"><?php echo _("1PPS"); ?></option>
                <option value="10MHz" selected="selected"><?php echo _("10 MHz Ref"); ?></option>
                <option value="AD9545 disabled"><?php echo _("AD9545 disabled"); ?></option>
            </select>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <object id="synchronaDiagram" type="image/svg+xml" data="app/img/syncrona.svg"
                    style="width: 100%"></object>
        </div>
        <div class="col-xs mr-3 mb-3">
            <br>
            <div class="input-group">
                <div class="custom-control custom-switch">
                    <input class="custom-control-input" id="pllsbypas" type="checkbox" name="pllsbypas"
                           value="1" aria-describedby="dhcp-iface-description" onclick="enableBypass()">
                    <label class="custom-control-label"
                           for="pllsbypas"><?php echo _("Enable CLKIN1 PLL1, PLL2 bypass") ?></label>
                </div>
            </div>
            <br>
            <div class="synchrona_input_group" id="pll1Config">
                <h6 class="mt-1"><?php echo _("PLL1"); ?></h6>
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="autorevertref" type="checkbox" name="dhcp-iface"
                                       value="1" aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="autorevertref"><?php echo _("Enable Auto Revert Reference") ?></label>
                            </div>
                        </div>
                <div class="input-group">
                    <div class="custom-control custom-switch">
                        <input class="custom-control-input" id="op2" type="checkbox" name="op2"
                               value="1" aria-describedby="dhcp-iface-description">
                        <label class="custom-control-label"
                               for="op2"><?php echo _("Enable option 2...") ?></label>
                    </div>
                </div>

            </div>


            <div class="synchrona_input_group" id="pll2Config">
                <h6 class="mt-1"><?php echo _("PLL2"); ?></h6>
                <div class="input-group">
                    <div class="custom-control custom-switch">
                        <input class="custom-control-input" id="op1pll2" type="checkbox" name="op1pll2"
                               value="1" aria-describedby="dhcp-iface-description">
                        <label class="custom-control-label"
                               for="op1pll2"><?php echo _("Enable option 1 ...") ?></label>
                    </div>
                </div>
                <div class="input-group">
                    <div class="custom-control custom-switch">
                        <input class="custom-control-input" id="op2pll2" type="checkbox" name="op2pll2"
                               value="1" aria-describedby="dhcp-iface-description">
                        <label class="custom-control-label"
                               for="op2pll2"><?php echo _("Enable option 2 ...") ?></label>
                    </div>
                </div>

            </div>


            <div class="synchrona_input_group" id="tempOpt1">
                <h6 class="mt-1"><?php echo _("TERM OPTION OUT 1"); ?></h6>
                Info/Diagram...
            </div>


        </div>
    </div>
</div><!-- /.tab-pane -->

