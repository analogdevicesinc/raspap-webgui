<!-- logfile output tab -->
<div class="tab-pane fade" id="debug">
  <h4 class="mt-3"><?php echo _("Debug") ?></h4>
  <div class="row">
    <div class="col-md-6">
      <h5><?php echo _("Synchrona device log") ?></h5>
      <textarea class="logoutput" id="debugsynchronastatusfield">Not loaded</textarea>
    </div>
    <div class="col-md-6">
      <h5><?php echo _("Synchrona server") ?></h5>
      <?php
        $log = shell_exec('sudo /bin/systemctl status synchrona.service');
        echo '<textarea class="logoutput">'.htmlspecialchars($log, ENT_QUOTES).'</textarea>';
      ?>
    </div>
    <div class="col-md-6">
      <br>
      <form method="post">
        <?php echo CSRFTokenFieldTag() ?>
          <input type="submit" class="btn btn-success" value="<?php echo _("Reload data") ?>" name="reloadsynchronalog" />
          <input type="submit" class="btn btn-outline btn-primary" value="<?php echo _("Restart server"); ?>" name="restartsynchronaserver" />
        </form>
    </div>
  </div>
</div><!-- /.tab-pane -->
