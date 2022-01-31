<?php

require_once 'includes/status_messages.php';

/**
 * Displays synchrona tab
 */
function DisplaySynchrona()
{
    $status = new StatusMessages();

    if (isset($_POST['restartsynchronaserver'])) {
        restartSynchronaServer($status);
    }
    if (isset($_POST['restartsynchronadt'])) {
        reloadSynchronaDevicetree($status);
    }
    echo renderTemplate("synchrona");
}

function restartSynchronaServer(&$status)
{
    exec('sudo /bin/systemctl restart synchrona.service', $commOutput, $return);
    if ($return == 0) {
        sleep(2);
        $status->addMessage('Synchrona server restarted successfully', 'success');
    } else {
        $status->addMessage('Synchrona server failed to restart.', 'danger');
    }
}

function reloadSynchronaDevicetree(&$status)
{
    exec('sudo /bin/cp '. RASPI_CONFIG . '/synchrona/rpi-ad9545-hmc7044.dtbo /boot/overlays/rpi-ad9545-hmc7044.dtbo', $commOutput, $return);
    if ($return == 0) {
        applyDeviceTree();
        $status->addMessage('Synchrona devicetree reloaded successfully', 'success');
    } else {
        $status->addMessage('Synchrona devicetree failed to reload.', 'danger');
    }
}

function applyDeviceTree() {
    exec('sudo /usr/bin/dtoverlay -r', $commOutput, $return);
    exec('sudo /usr/bin/dtoverlay /boot/overlays/rpi-ad9545-hmc7044.dtbo', $commOutput, $return);
    exec('sudo /usr/bin/sh /var/www/html/app/python/synchrona/rebind.sh', $commOutput, $return);
}
