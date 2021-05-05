<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col">
                        <i class="fas fa-wave-square mr-2"></i><?php echo _("AD-SYNCHRONA14-EBZ"); ?>
                        <a href="https://wiki.analog.com/ad-synchrona14-ebz">
                            <i class="fas fa-info-circle mr-2"></i>
                        </a>
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
                <script src="app/js/synchrona.js"></script>
            </div><!-- /.card-body -->
            <div class="card-footer"></div>
        </div><!-- /.card -->
    </div><!-- /.col-lg-12 -->
</div><!-- /.row -->
