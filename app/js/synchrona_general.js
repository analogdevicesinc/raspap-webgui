let svgDocument;
let htmlDocument;

const STATUS_CONNECTED = 'service-status-up';
const STATUS_DISCONNECTED = 'service-status-down';

const CHANNELS_NUMBER = 14;
const TWO_PORTS_CHANNELS_NUMBER = 10;

const ENABLE_COLOR = '#7d9c18';
const DISABLE_COLOR = '#f75f18';

const SELECT_STROKE = '0.7px'
const DESELECT_STROKE = '0px';

window.onload = function () {
    svgDocument = window.top.document.getElementById("synchronaImg").contentDocument;
    htmlDocument = window.top.document;
    htmlDocument.selectedChannels = new Set();
    if (document.contentType === 'text/html') {
        btnStatusClicked();
    }
}

/*
REST METHODS
 */
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function getConnectionStatus() {
    let connectionStatusClass = htmlDocument.getElementById("synchronaConnectionStatus").className;
    connectionStatusClass = connectionStatusClass.replace(`${STATUS_CONNECTED}` , '');
    connectionStatusClass = connectionStatusClass.replace(`${STATUS_DISCONNECTED}` , '');

    return fetch(`http://${ipAddress}:8000/synchrona/status`)
        .then(handleErrors)
        .then(response => {
            return response.json();
        })
        .then(data => {
            let ret = false;
            if (data.status === 'connected') {
                connectionStatusClass += `${STATUS_CONNECTED}`;
                htmlDocument.getElementById("synchronaConnectionMsg").innerHTML = "Connected";
                ret = true;
            } else {
                connectionStatusClass += `${STATUS_DISCONNECTED}`;
                htmlDocument.getElementById("synchronaConnectionMsg").innerHTML = "Disconnected";
            }
            htmlDocument.getElementById("synchronaConnectionStatus").className = connectionStatusClass;
            return ret;
        })
        .catch(error => {
            connectionStatusClass += `${STATUS_DISCONNECTED}`;
            htmlDocument.getElementById("synchronaConnectionStatus").className = connectionStatusClass;
            htmlDocument.getElementById("synchronaConnectionMsg").innerHTML = "Disconnected";
            console.log(error);
            return false;
        });
}

function getChannelData(chId) {
    console.log(`Get channel ${chId}`);

    if (chId > CHANNELS_NUMBER) {
        return null;
    }

    const url = `http://${ipAddress}:8000/synchrona/channels/${chId}`;
    return fetch(url)
            .then(handleErrors)
            .then(response => {
                return response.json();
            }).catch(error => {
                console.log(error)
                return null;
        });
}

function patchChannelData(chId, data) {
    fetch(`http://${ipAddress}:8000/synchrona/channels/${chId}`, {
        method: 'PATCH',
        body: data,
        headers: {
            "Content-type": "application/json",
            Accept: 'application/json',
        }
    })
        .then(response => response.json())
        .then(json => {
            console.info(`Update: ${JSON.stringify(json)}`);
            fillChannelData(chId, json);
        });
}

/*
Channels functions
 */
function selectChannel(chId) {
    if (chId <= TWO_PORTS_CHANNELS_NUMBER) {
        svgDocument.getElementById(`select_area_channel_${chId}_p`).style.strokeWidth = SELECT_STROKE;
        svgDocument.getElementById(`select_area_channel_${chId}_n`).style.strokeWidth = SELECT_STROKE;
    } else if (chId <= CHANNELS_NUMBER) {
        svgDocument.getElementById(`select_area_channel_${chId}`).style.strokeWidth = SELECT_STROKE;
    }

    htmlDocument.getElementById("synchronaTableBody").rows[chId-1].style.backgroundColor = "#1c83eb";
    htmlDocument.selectedChannels.add(chId);
}

function deselectChannel(chId) {
    if (chId <= TWO_PORTS_CHANNELS_NUMBER) {
        svgDocument.getElementById(`select_area_channel_${chId}_p`).style.strokeWidth = DESELECT_STROKE;
        svgDocument.getElementById(`select_area_channel_${chId}_n`).style.strokeWidth = DESELECT_STROKE;
    } else if (chId <= CHANNELS_NUMBER) {
        svgDocument.getElementById(`select_area_channel_${chId}`).style.strokeWidth = DESELECT_STROKE;
    }
    htmlDocument.getElementById("synchronaTableBody").rows[chId-1].style.removeProperty("background-color");
    htmlDocument.selectedChannels.delete(chId);
}

function isChannelSelected(id) {
    return document.getElementById(id).style.strokeWidth !== DESELECT_STROKE;
}

function updateChannelState(chId, state) {
    if (state === true) {
        if (chId <= TWO_PORTS_CHANNELS_NUMBER) {
            svgDocument.getElementById(`channel_${chId}_p`).style.fill = ENABLE_COLOR;
            svgDocument.getElementById(`channel_${chId}_n`).style.fill = ENABLE_COLOR;
        } else if (chId <= CHANNELS_NUMBER) {
            svgDocument.getElementById(`channel_${chId}`).style.fill = ENABLE_COLOR;
        }
    } else {
        if (chId <= TWO_PORTS_CHANNELS_NUMBER) {
            svgDocument.getElementById(`channel_${chId}_p`).style.fill = DISABLE_COLOR;
            svgDocument.getElementById(`channel_${chId}_n`).style.fill = DISABLE_COLOR;
        } else if (chId <= CHANNELS_NUMBER) {
            svgDocument.getElementById(`channel_${chId}`).style.fill = DISABLE_COLOR;
        }
    }
}

function fillChannelData(chId, data) {
    // channel state (enabled/disabled)
    setElementValue(`enable${chId}`, data.enable);
    updateChannelState(chId, data.enable);
    // channel mode (read-only)
    setElementValue(`mode${chId}`, data.mode);
    // output
    setElementValue(`output${chId}`, data.output);
    // frequency
    setElementValue(`frequency${chId}`, data.frequency);
    // slip
    setElementValue(`slip${chId}`, data.slip);
    // digital delay
    setElementValue(`digital_delay${chId}`, data.digital_delay);
    // analog delay
    setElementValue(`analog_delay${chId}`, data.analog_delay);
}

function fillTableData() {
    for (let chId = 1; chId <= CHANNELS_NUMBER; chId++) {
        getChannelData(chId)
            .then(data => {
                if (data == null) {
                    return false;
                }
                fillChannelData(chId, data);
                return true;
            });
    }
}

/*
Buttons calls
 */
function btnStatusClicked() {
    getConnectionStatus()
        .then(r => {
            // TODO uncomment (commented just for testing)
            // if (r === true) {
                fillTableData();
            // }
        });
}

function channelClicked(id) {
    const chId = parseInt(id.replace("select_area_channel_", ""));

    if (isChannelSelected(id)) {
        deselectChannel(chId);
    } else {
        selectChannel(chId);
    }
}

function selectAllClicked() {
    for (let i = 1; i <= CHANNELS_NUMBER; i++) {
        selectChannel(i);
    }
}

function selectNoneClicked() {
    for (let i = 1; i <= CHANNELS_NUMBER; i++) {
        deselectChannel(i);
    }
}

function updateChannel(chId, widgetId) {
    const widgetValue = getElementValue(`${widgetId}${chId}`)
    let data;

    if (htmlDocument.selectedChannels.has(chId)) {
        for (let ch of htmlDocument.selectedChannels) {
            data = JSON.stringify({
                id: ch,
                [widgetId]: widgetValue
            });
            patchChannelData(ch, data);
        }
    } else {
        data = JSON.stringify({
            id: chId,
            [widgetId]: widgetValue,
        });
        patchChannelData(chId, data);
    }
}

/*
Util functions
 */
function getElementValue(widgetId) {
    const element = htmlDocument.getElementById(widgetId);
    let elementType;
    if (element.tagName === 'INPUT') {
        elementType = element.type;
    } else if (element.tagName === 'SELECT') {
        elementType = 'select';
    }

    switch (elementType) {
        case 'checkbox':
            return element.checked;
        case 'select':
        case 'number':
            return element.value;
        default:
            console.warn('Unknown type');
            return null;
    }
}

function setElementValue(widgetId, widgetValue) {
    const element = htmlDocument.getElementById(widgetId);
    let elementType;
    if (element.tagName === 'INPUT') {
        elementType = element.type;
    } else if (element.tagName === 'SELECT') {
        elementType = 'select';
    } else if (element.tagName === 'LABEL') {
        elementType = 'label';
    }

    switch (elementType) {
        case 'checkbox':
            element.checked = widgetValue;
            break;
        case 'select':
        case 'number':
            element.value = widgetValue;
            break;
        case 'label':
            element.innerHTML = widgetValue;
            break;
        default:
            console.warn('Unknown type');
    }
}
