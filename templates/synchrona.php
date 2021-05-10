<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col">
                        <i class="fas fa-wave-square mr-2"></i><?php echo _("AD-SYNCHRONA14-EBZ"); ?>
                    </div>
                    <div class="col">
                        <button class="btn btn-light btn-icon-split btn-sm service-status float-right" onclick="btnStatusClicked()">
                            <span class="icon"><i id="synchronaConnectionStatus" class="fas fa-circle service-status-<?php echo ("down") ?>"></i></span>
                            <span id="synchronaConnectionMsg" class="text service-status"><?php echo ("Disconnected") ?></span>
                        </button>
                    </div>
                </div><!-- ./row -->
            </div><!-- ./card-header -->
            <div class="card-body">

                <!-- Nav tabs -->
                <ul class="nav nav-tabs">
                    <li class="nav-item"><a class="nav-link active" href="#synchronageneral" data-toggle="tab"><?php echo _("General"); ?></a></li>
                    <li class="nav-item"><a class="nav-link" href="#synchronaadvanced" data-toggle="tab"><?php echo _("Advanced"); ?></a></li>
                </ul>
                <!-- /.nav-tabs -->

                <!-- Tab panes -->
                <div class="tab-content">
                    <?php echo renderTemplate("synchrona/general", $__template_data) ?>
                    <?php echo renderTemplate("synchrona/advanced", $__template_data) ?>
                </div>
                <!-- /.tab-content -->

            </div><!-- /.card-body -->
            <div class="card-footer"></div>
        </div><!-- /.card -->
    </div><!-- /.col-lg-12 -->
</div><!-- /.row -->
