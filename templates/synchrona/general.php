<?php
$output = shell_exec('hostname -I');
$replace_chars = array("\r\n", "\n", "\r", " ");
$rpiIP = str_replace($replace_chars, "", $output);
?>

<style>
    .table tbody tr td {
        padding: 3px 12px;
        color: black;
    }
</style>

<div class="tab-pane active" id="synchronageneral">
    <div class="tab-content">
        <script type="text/javascript">
            var ipAddress = '<?php echo $rpiIP; ?>';
        </script>
        <script type="text/javascript" src="app/js/synchrona_general.js"></script>
        <div role="tabpanel" class="tab-pane active" id="summary">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <h4><?php echo("Output configuration"); ?></h4>
                            <div class="row">
                                <div class="col">
                                    <object id="synchronaImg" type="image/svg+xml" data="app/img/synchrona.svg"
                                            style="width: 100%"></object>
                                </div>
                                <div class="col-xs mr-3 mb-3">
                                    <input type="submit" class="btn btn-warning" id="btnselectallch" name="SelectAllCh"
                                           value="<?php echo("Select All"); ?>" onclick="selectAllClicked()"/>
                                    <input type="submit" class="btn btn-warning" id="btnselectnonech"
                                           name="SelectNonech"
                                           value="<?php echo("Select None"); ?>" onclick="selectNoneClicked()"/>
                                    <div>
                                        <figure class="figure">
                                            <img src="app/img/synchrona_ch_legend.svg" alt="Channel legend" style=" max-height: 200px">
                                            <figcaption
                                                    class="figure-caption"><?php echo _("Channels display state"); ?></figcaption>
                                        </figure>
                                    </div>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover" id="synchronaTable">
                                    <thead>
                                    <tr>
                                        <th><?php echo("Id"); ?></th>
                                        <th><?php echo("Enable"); ?></th>
                                        <th><?php echo("Mode"); ?></th>
                                        <th><?php echo("Output"); ?></th>
                                        <th><?php echo("Frequency (Hz)"); ?></th>
                                        <th><?php echo("Slip (ps)"); ?></th>
                                        <th><?php echo("Digital Delay (ps)"); ?></th>
                                        <th><?php echo("Analog Delay (ps)"); ?></th>
                                    </tr>
                                    </thead>
                                    <tbody id="synchronaTableBody">
                                    <script>
                                        let table = document.getElementById("synchronaTableBody");
                                        for (let chId = 1; chId <= 14; chId++) {
                                            let row = table.insertRow();

                                            // channel id (read-only)
                                            let cell = row.insertCell(0);
                                            cell.innerHTML = chId;

                                            // channel state (enabled/disabled)
                                            cell = row.insertCell(1);
                                            input = document.createElement('input');
                                            input.type = "checkbox";
                                            input.id = `enable${chId}`;
                                            input.onchange = function () {
                                                updateChannel(chId, 'enable');
                                            };

                                            cell.appendChild(input);

                                            // channel mode (read-only)
                                            cell = row.insertCell(2);
                                            input = document.createElement('label');
                                            input.id = `mode${chId}`;
                                            input.textContent = "?";
                                            cell.appendChild(input);

                                            // output
                                            cell = row.insertCell(3);
                                            input = document.createElement('select');
                                            let option = document.createElement("option");
                                            option.text = "clk";
                                            input.add(option);
                                            option = document.createElement("option");
                                            option.text = "sclk";
                                            input.add(option);
                                            input.id = `output${chId}`;
                                            input.onchange = function () {
                                                updateChannel(chId, 'output');
                                            };
                                            cell.appendChild(input);

                                            const attrNames = ['frequency', 'slip', 'digital_delay', 'analog_delay'];
                                            for (let j = 4; j < 8; j++) {
                                                cell = row.insertCell(j);
                                                input = document.createElement('input');
                                                input.type = "number";
                                                input.id = `${attrNames[j - 4]}${chId}`;
                                                input.onchange = function () {
                                                    updateChannel(chId, attrNames[j - 4]);
                                                };
                                                cell.appendChild(input);
                                            }
                                        }
                                    </script>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div><!-- /.row -->
</div><!-- /.tab-pane | general tab -->
