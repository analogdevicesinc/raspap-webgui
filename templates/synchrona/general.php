
<style>
    .table tbody tr td {
        padding: 3px 12px;
        color: black;
    }
</style>

<div class="tab-pane active" id="synchronageneral">
    <h4 class="mt-3"><?php echo("Output configuration"); ?></h4>
    <div class="row">
        <div class="col">
            <object id="synchronaImg" type="image/svg+xml" data="app/img/synchrona.svg"
                    style="width: 100%"></object>
        </div>
        <div class="col-xs mr-3 mb-3" style="margin-left: 3px;">
            <div class="row">
                <input type="submit" class="btn btn-warning" id="gen_btnreconfig" name="RecomputeGeneral"
                        value="<?php echo("Reload config"); ?>" style="width: 100%; margin-bottom: 5px;"/>
            </div>
            <div class="row">
                <form method="post" enctype="multipart/form-data" style="width: 100%;">
                    <?php echo CSRFTokenFieldTag() ?>
                    <label for="file-upload" class="btn btn-warning" style="width: 100%; margin-bottom: 5px;">
                        <i class="fas fa-file-upload"></i> <?php echo _("Import devicetree") ?>
                    </label>
                    <input id="file-upload" type="file" name="synchronaimportdt" onchange="this.form.submit()" accept=".dtb,.dtbo" style="display: none;"/>
                </form>
            </div>
            <div class="row">
                <form method="post" style="width: 100%;">
                    <?php echo CSRFTokenFieldTag() ?>
                    <button type="submit" name="synchronaexportdt" class="btn btn-warning" style="width: 100%; margin-bottom: 5px;">
                    <i class="fas fa-file-download"></i> <?php echo _("Export devicetree") ?> </a>
                </form>
            </div>
            <div class="row" style="margin-bottom: 3px;">
                <input type="submit" class="btn btn-warning" id="btnselectall" name="SelectAllCh"
                        value="<?php echo("Select All"); ?>" />
                <input type="submit" class="btn btn-warning" id="btnselectnone"
                        name="SelectNonech"
                        value="<?php echo("Select None"); ?>" style="margin-left: 2px;"/>
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
                <th><?php echo("Frequency (Hz)"); ?></th>
                <th><?php echo("Coarse Delay (ps)"); ?></th>
            </tr>
            </thead>
            <tbody id="synchronaTableBody">
            <script>
                let table = document.getElementById("synchronaTableBody");
                const chMode = ['LVPECL', 'LVPECL', 'LVPECL', 'LVPECL', 'CMOS',
                    'LVPECL', 'CMOS', 'LVDS', 'LVDS', 'LVDS', 'LVDS', 'CMOS', 'LVPECL', 'CMOS'];
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

                    cell.appendChild(input);

                    // channel mode (read-only)
                    cell = row.insertCell(2);
                    input = document.createElement('label');
                    input.id = `mode${chId}`;
                    input.textContent = chMode[chId - 1];
                    cell.appendChild(input);

                    cell = row.insertCell(3);
                    input = document.createElement('input');
                    input.id = `frequency_ch${chId}`;
                    cell.appendChild(input);

                    cell = row.insertCell(4);
                    input = document.createElement('input');
                    input.type = "number";
                    input.id = `coarse_delay_ch${chId}`;
                    cell.appendChild(input);
                }
            </script>
            </tbody>
        </table>
    </div><!-- /.row -->
</div><!-- /.tab-pane | general tab -->
