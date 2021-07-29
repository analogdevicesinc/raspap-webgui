<style>
    .synchrona_input_group {
        padding: 5px;
        border-style: solid;
        border-width: thin;
    }
</style>

<div class="tab-pane fade" id="synchronaadvanced">
    <h4 class="mt-3">Advanced controls</h4>
    <div class="row">

        <div class="form-group col-md-6">
            <h5 class="mt-1"><?php echo _("HMC7044"); ?></h5>
            <h6 class="mt-1"><?php echo _("PLL1"); ?></h6>
            <div class="synchrona_input_group">
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("CLKIN Frequencies"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtclkfreq" name="CLKINFrequencies"/>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("VCXO Frequency"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="cbxvvxofreq" name="VCXOFreq" class="form-control">
                            <option value="m"><?php echo _("AUTO"); ?></option>
                            <option value="h"><?php echo _("100MHz"); ?></option>
                            <option value="h"><?php echo _("122.88MHz"); ?></option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("PLL1 Reference Priority"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtpllrefpriority" value="1234" name="RefPriority"/>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="autorevertref" type="checkbox" name="dhcp-iface"
                                       value="1" aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="autorevertref"><?php echo _("Enable Auto Revert PLL1 Reference") ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="custom-control custom-switch">
                            <input class="custom-control-input" id="pllloopbandwidth" type="checkbox"
                                   name="pllloopbandwidth" value="1" aria-describedby="dhcp-iface-description">
                            <label class="custom-control-label"
                                   for="pllloopbandwidth"><?php echo _("Manual PLL1 loop bandwidth") ?></label>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtpllloopbandwidth" name="TxtPllLoops"/>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="custom-control custom-switch">
                            <input class="custom-control-input" id="pllmaxpfdauto" type="checkbox" name="pllmaxpfdauto"
                                   value="1" aria-describedby="dhcp-iface-description">
                            <label class="custom-control-label"
                                   for="pllmaxpfdauto"><?php echo _("Manual PLL1 max PFD") ?></label>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtpllmaxpfdauto" name="Txtpllmaxpfdauto"/>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="custom-control custom-switch">
                            <input class="custom-control-input" id="chargepump" type="checkbox" name="pllloopbandwidth"
                                   value="1" aria-describedby="dhcp-iface-description">
                            <label class="custom-control-label"
                                   for="chargepump"><?php echo _("Manual PLL1 charge pump current") ?></label>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtchargepump" name="Txtchargepump"/>
                    </div>
                </div>
            </div>
            <h6 class="mt-1"><?php echo _("PLL2"); ?></h6>
            <div class="synchrona_input_group">
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="custom-control custom-switch">
                            <input class="custom-control-input" id="plldistribution" type="checkbox"
                                   name="plldistribution"
                                   value="1" aria-describedby="dhcp-iface-description">
                            <label class="custom-control-label"
                                   for="plldistribution"><?php echo _("Manual PLL2 distribution clock") ?></label>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txtplldistribution" name="Txtplldistribution"/>
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="pllsbypas" type="checkbox" name="pllsbypas"
                                       value="1" aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="pllsbypas"><?php echo _("Enable CLKIN1 PLL1, PLL2 bypass") ?></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h6 class="mt-1"><?php echo _("PulseGen & SYSREF"); ?></h6>
            <div class="synchrona_input_group">
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("Pulse Generation Mode"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="cbxpulsegenmode" name="RangeLeaseTimeUnits" class="form-control">
                            <option value="m"><?php echo _("1Pulse"); ?></option>
                            <option value="h"><?php echo _("2Pulse"); ?></option>
                            <option value="m"><?php echo _("4Pulse"); ?></option>
                            <option value="m"><?php echo _("8Pulse"); ?></option>
                            <option value="m"><?php echo _("16Pulse"); ?></option>
                            <option value="m"><?php echo _("Continuous"); ?></option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="custom-control custom-switch">
                            <input class="custom-control-input" id="timerdivered" type="checkbox" name="timerdivered"
                                   value="1" aria-describedby="dhcp-iface-description">
                            <label class="custom-control-label"
                                   for="timerdivered"><?php echo _("Manual SYSREF Timer Divider") ?></label>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="txttimerdivered" name="Txttimerdivered"/>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="rfreseeder" type="checkbox" name="dhcp-iface"
                                       value="1" aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="rfreseeder"><?php echo _("Enable RF Reseeder") ?></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h6 class="mt-1"><?php echo _("SYNC"); ?></h6>
            <div class="synchrona_input_group">
                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="rfsync" type="checkbox" name="dhcp-iface"
                                       value="1"
                                       aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="rfsync"><?php echo _("Enable CLKIN0 RFSYNC") ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("SYNC Input Mode"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="cbxsyncinputmode" name="RangeLeaseTimeUnits" class="form-control">
                            <option value="m"><?php echo _("Disabled"); ?></option>
                            <option value="h"><?php echo _("SYNC"); ?></option>
                            <option value="m"><?php echo _("Pulse generator"); ?></option>
                            <option value="m"><?php echo _("SYNC if alarm exists, otherwise pulse generator"); ?></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-group col-md-6">
            <h5 class="mt-1"><?php echo _("AD9545"); ?></h5>
            <br>
            <div class="synchrona_input_group">
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="code"><?php echo _("Reference input"); ?></label>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="cbxRefInput" name="RangeLeaseTimeUnits" class="form-control">
                            <option value="m"><?php echo _("10MHz"); ?></option>
                            <option value="h"><?php echo _("1PPS"); ?></option>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-md-6">
                        <div class="input-group">
                            <div class="custom-control custom-switch">
                                <input class="custom-control-input" id="zerodelay" type="checkbox" name="dhcp-iface"
                                       value="1" aria-describedby="dhcp-iface-description">
                                <label class="custom-control-label"
                                       for="zerodelay"><?php echo _("Enable 1PPS ZERO delay mode") ?></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div><!-- /.tab-pane -->

