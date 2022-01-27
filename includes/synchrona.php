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
