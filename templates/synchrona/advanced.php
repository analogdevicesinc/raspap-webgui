<style>
    .synchrona_input_group {
        padding: 5px;
        border-style: solid;
        border-width: thin;
        display: none;
    }
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap');
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
    }
    .wrapper{
        background: #fff;
        padding: 10px;
        max-width: 460px;
        width: 100%;
        border-radius: 3px;
        border-style: solid;
        border-width: thin;
    }
    .wrapper .item{
        color: #ffffff;
        display: flex;
        margin-bottom: 8px;
        padding: 5px 7px;
        background: #252525;
        border-radius: 3px;
        align-items: center;
        justify-content: space-between;
    }
    .wrapper .item:last-child{
        margin-bottom: 0px;
    }
    .wrapper .item .text{
        font-size: 18px;
        font-weight: 400;
    }
    .wrapper .item i{
        font-size: 18px;
        cursor: pointer;
    }
</style>

<div class="tab-pane fade" id="synchronaadvanced">
    <h4 class="mt-3">Advanced controls</h4>
    <div class="row">
        <div class="col">
            <label for="code"><?php echo _("Diagram configuration"); ?></label>
            <select id="cbxusecase" name="Input" class="form-control">
                <option value="50MHz"><?php echo _("Main Use Case"); ?></option>
                <option value="1PPS"><?php echo _("1PPS"); ?></option>
            </select>
        </div>
        <div class="col">
        </div>
    </div>
    <br>
    <div class="row">
        <div class="col">
            <object id="synchronaDiagram" type="image/svg+xml" data="app/img/synchrona_diagram.svg"
                    style="width: 100%"></object>
        </div>
        <div class="col-xs mr-3 mb-3">
            <div>
                <input type="submit" class="btn btn-warning" id="adv_btnreconfig" name="Recompute" value="<?php echo _("Reload config"); ?>" style="width: 100%; min-width: 180px"/>
            </div>
            <br>
            <div>
                <label for="code"><?php echo _("Input priority"); ?></label>
            </div>
            <div class="wrapper" id="sortedElement">
                <div id="50mhz" class="item">
                    <span class="text">50 MHz</span>
                    <i class="fas fa-bars"></i>
                </div>
                <div id="pps" class="item">
                    <span class="text">PPS</span>
                    <i class="fas fa-bars"></i>
                </div>
                <!--         TO BE ADD FOR REV B       -->
                <!--                <div id="ref_in" class="item">-->
                <!--                    <span class="text">REF IN</span>-->
                <!--                    <i class="fas fa-bars"></i>-->
                <!--                </div>-->
                <!--                <div id="ref_clk" class="item">-->
                <!--                    <span class="text">REF CLK</span>-->
                <!--                    <i class="fas fa-bars"></i>-->
                <!--                </div>-->
                <!--                <div id="tcxo" class="item">-->
                <!--                    <span class="text">TCXO </span>-->
                <!--                    <i class="fas fa-bars"></i>-->
                <!--                </div>-->
            </div>
            <br>

            <!--      JUST DEMONSTRATIVE      -->
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

