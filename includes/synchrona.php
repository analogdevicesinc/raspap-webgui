<?php

require_once 'includes/status_messages.php';


if (isset($_POST['synchronaexportdt'])) {
    $file = '/boot/overlays/rpi-ad9545-hmc7044.dtbo';

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='.basename($file));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        ob_clean();
        flush();
        readfile($file);
        exit;
    } else {
        header("HTTP/1.0 404 Not Found");
        exit;
    }
}

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
    if (isset($_FILES["synchronaimportdt"]["name"])) {
        importDevicetree();
    }
    if (isset($_POST['synchronize'])) {
        synchronize();
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

function importDevicetree()
{
    $target_file = "/etc/raspap/synchrona/tmp.dtbo";
    move_uploaded_file($_FILES["synchronaimportdt"]["tmp_name"], $target_file);
    exec('sudo /bin/cp /etc/raspap/synchrona/tmp.dtbo /boot/overlays/rpi-ad9545-hmc7044.dtbo', $commOutput, $return);
    applyDeviceTree();
    exec('sudo /bin/rm /etc/raspap/synchrona/tmp.dtbo', $commOutput, $return);
}

function applyDeviceTree() {
    exec('sudo /usr/bin/dtoverlay -r', $commOutput, $return);
    exec('sudo /usr/bin/dtoverlay /boot/overlays/rpi-ad9545-hmc7044.dtbo', $commOutput, $return);
}

function synchronize() {
    exec('sudo /usr/bin/sh -c "echo sync > /sys/bus/iio/devices/iio\:device0/sync_pin_mode"', $commOutput, $return);
}
