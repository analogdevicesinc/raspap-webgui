
const STATUS_CONNECTED = 'service-status-up';
const STATUS_DISCONNECTED = 'service-status-down';

const ADVANCED_CHANNEL_ENABLE_COLOR = 'rgb(44, 107, 27)';
const ADVANCED_CHANNEL_DISABLE_COLOR = 'rgb(166, 31, 31)';

const SELECT_STROKE = '0.7px';
const DESELECT_STROKE = '0px';

const SELECT_ROW_COLOR = 'rgb(28, 131, 235)';

const generalSvgElement = document.getElementById("synchronaImg");
const advancedSvgElement = document.getElementById("synchronaDiagram");

let generalSvgDocument;
let advancedSvgDocument;

let ipAddress = location.host;

let sortableList;
let importedScript = document.createElement('script');
importedScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.10.2/Sortable.min.js';
document.head.appendChild(importedScript);

let selectedChannels = new Set();

generalSvgElement.addEventListener("load",function(){
    generalSvgDocument = generalSvgElement.contentDocument;
    for (let chId = 1; chId <= 10; chId++) {
        generalSvgDocument.getElementById(`output_ch${chId}_p`).style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
        generalSvgDocument.getElementById(`output_ch${chId}_n`).style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;

        generalSvgDocument.getElementById(`select_area_channel_${chId}_p`).addEventListener('click', onChannelSelected);
        generalSvgDocument.getElementById(`select_area_channel_${chId}_n`).addEventListener('click', onChannelSelected);
    }
    for (let chId = 11; chId <= 14; chId++) {
        generalSvgDocument.getElementById(`output_ch${chId}`).style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;

        generalSvgDocument.getElementById(`select_area_channel_${chId}`).addEventListener('click', onChannelSelected);
    }

    getConnectionStatus();

    /*
    * ugly workaround - todo: remove it
    * the advanced tab is not yet loaded
    * in some browsers the advanced tab is loaded only when that tab is opened
    * getChannelData should have different implementation for each tab
    */
    //window.location.href = `http://${ipAddress}/synchrona/#synchronaadvanced`;
    //window.location.href = `http://${ipAddress}/synchrona/#synchronageneral`;
}, false);

advancedSvgElement.addEventListener("load",function(){
    advancedSvgDocument = advancedSvgElement.contentDocument;

    // two-outputs non-CMOS channels
    [1, 2, 3, 4, 6, 8, 9, 10].forEach( function (chId) {
        document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_p`).addEventListener('click', onCombinedChannelClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_n`).addEventListener('click', onCombinedChannelClicked);
    });

    // two-outpus CMOS channels
    [5, 7].forEach( function (chId) {
        document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_p`).addEventListener('click', onChannelClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_n`).addEventListener('click', onChannelClicked);
    });

    // one-output channels
    for (let chId = 11; chId <= 14; chId++) {
        document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}`).addEventListener('click', onChannelClicked);
    }

    // vcxo
    advancedSvgDocument.getElementById('VCXO100').addEventListener('click', switchVCXO_TCXO);
    advancedSvgDocument.getElementById('VCXO122').addEventListener('click', switchVCXO_TCXO);

    // tcxo
    advancedSvgDocument.getElementById('TCXO40').addEventListener('click', switchVCXO_TCXO);
    advancedSvgDocument.getElementById('TCXO38').addEventListener('click', switchVCXO_TCXO);

    // init input
    advancedSvgDocument.getElementById('input_ad9545_internal').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    advancedSvgDocument.getElementById('input_ad9545_internal').style.stroke = ADVANCED_CHANNEL_ENABLE_COLOR;
    advancedSvgDocument.getElementById('input_ad9545_sync').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    advancedSvgDocument.getElementById('input_ad9545_pps').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    advancedSvgDocument.getElementById('input_ad9545_ref_in').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    advancedSvgDocument.getElementById('ref_out').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    advancedSvgDocument.getElementById('input_hmc7044_ch3').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    advancedSvgDocument.getElementById('input_hmc7044_ch2').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    advancedSvgDocument.getElementById('input_hmc7044_ch1').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;

    for (let chId = 1; chId <= 14; chId++) {
        document.getElementById(`frequency_ch${chId}`).addEventListener('change', generalMenuUpdateFrequency);
        advancedSvgDocument.getElementById(`frequency_ch${chId}`).addEventListener('change', advancedMenuUpdateFrequency);

        document.getElementById(`coarse_delay_ch${chId}`).addEventListener('change', generalMenuUpdateCoarseDelay);
        advancedSvgDocument.getElementById(`coarse_delay_ch${chId}`).addEventListener('change', advancedMenuUpdateCoarseDelay);

        document.getElementById(`fine_delay_ch${chId}`).addEventListener('change', generalMenuUpdateFineDelay);
        advancedSvgDocument.getElementById(`fine_delay_ch${chId}`).addEventListener('change', advancedMenuUpdateFineDelay);
    }

    document.getElementById('btnselectall').addEventListener('click', selectAll);
    document.getElementById('btnselectnone').addEventListener('click', selectNone);
    document.getElementById('gen_btnreconfig').addEventListener('click', reloadConfig);
    document.getElementById('adv_btnreconfig').addEventListener('click', reloadConfig);

    getChannelData();
}, false);

importedScript.addEventListener("load",function() {
    const dragArea = document.querySelector(".wrapper");
    sortableList = new Sortable(dragArea, {
        animation: 350
    });
}, false);

/*
 * ENABLE FUNCTIONALITY
 */

// General Menu
function generalMenuCheckBoxClicked(event) {
    let element = event.target;
    let chId = element.id.match(/\d+/)[0];
    let enable = element.checked;

    if (selectedChannels.has(parseInt(chId))) {
        // modify all selected channels
        for (let ch of selectedChannels) {
            enableChannel(ch, enable);
        }
    } else {
        enableChannel(chId, enable);
    }
}

function enableChannel(chId, enable) {
    document.getElementById(`enable${chId}`).checked = enable;
    if (1 <= chId && chId <= 10) {
        /*
         * two-outputs channels
         * in this case we treat ch 5 and 7 as the others (not CMOS)
         * the functionality of enabling separately the outputs is available only in the advanced menu
         */
        setChannelState(advancedSvgDocument.getElementById(`output_ch${chId}_p`), enable);
        setChannelState(advancedSvgDocument.getElementById(`output_ch${chId}_n`), enable);
        setChannelState(generalSvgDocument.getElementById(`output_ch${chId}_p`), enable);
        setChannelState(generalSvgDocument.getElementById(`output_ch${chId}_n`), enable);
    } else {
        /*
         * one-outputs channels
         */
        setChannelState(advancedSvgDocument.getElementById(`output_ch${chId}`), enable);
        setChannelState(generalSvgDocument.getElementById(`output_ch${chId}`), enable);
    }
}

function setChannelState(element, enable) {
    if (enable) {
        element.style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    } else {
        element.style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    }
}

function onChannelClicked(event) {
    let element = event.target;
    let chId = element.id;

    let enable = switchChannelState(advancedSvgDocument.getElementById(chId));
    switchChannelState(generalSvgDocument.getElementById(chId));

    let chIndex = chId.match(/\d+/)[0];
    if (isCombinedCMOSChannel(chIndex)) {
        let chElementP = advancedSvgDocument.getElementById(`output_ch${chIndex}_p`);
        let chElementN = advancedSvgDocument.getElementById(`output_ch${chIndex}_n`);
        enable = !(chElementP.style.fill === ADVANCED_CHANNEL_DISABLE_COLOR
            && chElementN.style.fill === ADVANCED_CHANNEL_DISABLE_COLOR)
    }
    document.getElementById(`enable${chIndex}`).checked = enable;
}

function onCombinedChannelClicked(event) {
    let element = event.target;
    let chId = element.id.match(/\d+/)[0];

    let enable = switchChannelState(advancedSvgDocument.getElementById(`output_ch${chId}_p`));
    switchChannelState(advancedSvgDocument.getElementById(`output_ch${chId}_n`));
    switchChannelState(generalSvgDocument.getElementById(`output_ch${chId}_p`));
    switchChannelState(generalSvgDocument.getElementById(`output_ch${chId}_n`));

    document.getElementById(`enable${chId}`).checked = enable;
}

function switchChannelState(element) {
    if (ADVANCED_CHANNEL_ENABLE_COLOR === element.style.fill) {
        element.style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
        return false;
    } else {
        element.style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    }
    return true;
}

function isCombinedCMOSChannel(chId) {
    return (chId === '5' || chId === '7');
}

function setVCXO_TCXO(vcxo) {
    if (vcxo === 100000000) {
        advancedSvgDocument.getElementById("VCXO100").style.fillOpacity = 0;
        advancedSvgDocument.getElementById("TCXO40").style.fillOpacity = 0;

        advancedSvgDocument.getElementById("VCXO122").style.fillOpacity = 0.6;
        advancedSvgDocument.getElementById("TCXO38").style.fillOpacity = 0.6;
    } else {
        advancedSvgDocument.getElementById("VCXO122").style.fillOpacity = 0;
        advancedSvgDocument.getElementById("TCXO38").style.fillOpacity = 0;

        advancedSvgDocument.getElementById("VCXO100").style.fillOpacity = 0.6;
        advancedSvgDocument.getElementById("TCXO40").style.fillOpacity = 0.6;
    }
}

function switchVCXO_TCXO(event) {
    let id = event.target.id;
    if (id === "VCXO100" || id === "TCXO40") {
        advancedSvgDocument.getElementById("VCXO100").style.fillOpacity = 0;
        advancedSvgDocument.getElementById("TCXO40").style.fillOpacity = 0;

        advancedSvgDocument.getElementById("VCXO122").style.fillOpacity = 0.6;
        advancedSvgDocument.getElementById("TCXO38").style.fillOpacity = 0.6;
    } else {
        advancedSvgDocument.getElementById("VCXO122").style.fillOpacity = 0;
        advancedSvgDocument.getElementById("TCXO38").style.fillOpacity = 0;

        advancedSvgDocument.getElementById("VCXO100").style.fillOpacity = 0.6;
        advancedSvgDocument.getElementById("TCXO40").style.fillOpacity = 0.6;
    }
}

function toHz(frequencyString) {
    let formattedString = frequencyString.replace(/\s/g, "").toLowerCase();
    let frequency = parseFloat(formattedString);
    let unit;
    try {
        unit = formattedString.match(/[a-zA-Z]+/g).toString();
    } catch (err) {
        return frequency;
    }

    let multiplyFactor = 1;
    switch (unit[0]) {
        case 'k':
            multiplyFactor = 1E3;
            break;
        case 'm':
            multiplyFactor = 1E6;
            break;
        case 'g':
            multiplyFactor = 1E9;
            break;
        case 't':
            multiplyFactor = 1E12;
            break;
    }

    return  frequency * multiplyFactor;
}

/*
 * Frequency
 */
function generalMenuUpdateFrequency(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    if (selectedChannels.has(parseInt(chId))) {
        // modify all selected channels
        for (let ch of selectedChannels) {
            updateFrequency(ch, value);
        }
    } else {
        updateFrequency(chId, value);
    }
}

function advancedMenuUpdateFrequency(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    updateFrequency(chId, value);
}

function updateFrequency(chId, value) {
    let newValue = toHz(value);

    document.getElementById(`frequency_ch${chId}`).value = newValue;
    advancedSvgDocument.getElementById(`frequency_ch${chId}`).value = newValue;
}

function updateDivider(chId, value) {
    advancedSvgDocument.getElementById(`divider${chId}`).textContent = value;
}

/*
 * Coarse Delay
 */

function generalMenuUpdateCoarseDelay(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    if (selectedChannels.has(parseInt(chId))) {
        // modify all selected channels
        for (let ch of selectedChannels) {
            updateCoarseDelay(ch, value);
        }
    } else {
        updateCoarseDelay(chId, value);
    }
}

function advancedMenuUpdateCoarseDelay(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    updateCoarseDelay(chId, value);
}

function updateCoarseDelay(chId, value) {
    document.getElementById(`coarse_delay_ch${chId}`).value = value;
    advancedSvgDocument.getElementById(`coarse_delay_ch${chId}`).value = value;
}

/*
 * Fine Delay
 */

function generalMenuUpdateFineDelay(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    if (selectedChannels.has(parseInt(chId))) {
        // modify all selected channels
        for (let ch of selectedChannels) {
            updateFineDelay(ch, value);
        }
    } else {
        updateFineDelay(chId, value);
    }
}

function advancedMenuUpdateFineDelay(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    updateFineDelay(chId, value);
}

function updateFineDelay(chId, value) {
    document.getElementById(`fine_delay_ch${chId}`).value = value;
    advancedSvgDocument.getElementById(`fine_delay_ch${chId}`).value = value;
}

/*
 * Channel Selection
 */

function switchChannelSelect(element) {
    if (SELECT_STROKE === element.style.strokeWidth) {
        element.style.strokeWidth = DESELECT_STROKE;
        return false;
    } else {
        element.style.strokeWidth = SELECT_STROKE;
    }
    return true;
}

function onChannelSelected(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let selected;

    if (chId < 11) {
        selected = switchChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_p`));
        switchChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_n`));
    } else {
        selected = switchChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}`));
    }

    if (selected) {
        document.getElementById("synchronaTableBody").rows[chId-1].style.backgroundColor = SELECT_ROW_COLOR;
        selectedChannels.add(parseInt(chId));
    } else {
        document.getElementById("synchronaTableBody").rows[chId-1].style.removeProperty("background-color");
        selectedChannels.delete(parseInt(chId));
    }
}

function setChannelSelect(element, selected) {
    if (selected) {
        element.style.strokeWidth = SELECT_STROKE;
    } else {
        element.style.strokeWidth = DESELECT_STROKE;
    }
}

function selectAll() {
    for (let chId = 1; chId <= 10; chId++) {
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_p`), true);
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_n`), true);
        document.getElementById("synchronaTableBody").rows[chId-1].style.backgroundColor = SELECT_ROW_COLOR;
        selectedChannels.add(parseInt(chId));
    }
    for (let chId = 11; chId <= 14; chId++) {
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}`), true);
        document.getElementById("synchronaTableBody").rows[chId-1].style.backgroundColor = SELECT_ROW_COLOR;
        selectedChannels.add(parseInt(chId));
    }
}

function selectNone() {
    for (let chId = 1; chId <= 10; chId++) {
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_p`), false);
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}_n`), false);
        document.getElementById("synchronaTableBody").rows[chId-1].style.removeProperty("background-color");
        selectedChannels.delete(parseInt(chId));
    }
    for (let chId = 11; chId <= 14; chId++) {
        setChannelSelect(generalSvgDocument.getElementById(`select_area_channel_${chId}`), false);
        document.getElementById("synchronaTableBody").rows[chId-1].style.removeProperty("background-color");
        selectedChannels.delete(parseInt(chId));
    }
}

function loadingButton(element, loading) {
    if (loading) {
        element.style.backgroundImage = 'url("app/img/loading-spinner.gif")';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
        element.value = "";
    } else {
        element.style.background = null;
        element.value = "Reload config";
    }
}

function reloadConfig() {
    loadingButton(document.getElementById("gen_btnreconfig"), true);
    loadingButton(document.getElementById("adv_btnreconfig"), true);

    let data = getJSON();

    fetch(`http://${ipAddress}:8000/synchrona/outputs`, {
        method: 'PATCH',
        body: data,
        headers: {
            "Content-type": "application/json",
            Accept: 'application/json',
        }
    })
        .then(response => response.json())
        .then(json => {
            if (json == null) {
                alert("Invalid frequencies");
            } else {
                setVCXO_TCXO(json.vcxo);
                for (let i = 1; i <= 14; i++) {
                    updateDivider(i, json.channels[i-1].divider);
                }
            }
            loadingButton(document.getElementById("gen_btnreconfig"), false);
            loadingButton(document.getElementById("adv_btnreconfig"), false);
            console.info('Synchrona updated');
        });
}

function getJSON() {
    let channels_data = [];
    for (let chId = 1; chId <= 14; chId++) {
        channels_data.push(getChannelJSON(chId));
    }

    return JSON.stringify({
        vcxo: getVCXO(),
        input_priority: getInputPriority(),
        channels: channels_data,
    });
}

function getVCXO() {
    if ( advancedSvgDocument.getElementById("VCXO100").style.fillOpacity === 0) {
        return 122880000;
    }
    return 100000000;
}

function getInputPriority() {
    let children = document.getElementById('sortedElement').childNodes;
    let list = [];
    for (let x in children) {
        if (children[x].id !== undefined) {
            list.push(children[x].id);
        }
    }
    return list;
}

function getChannelJSON(chId) {
    let cmosVal = 0;
    if (chId === 5 || chId === 7) {
        if (advancedSvgDocument.getElementById(`output_ch${chId}_p`).style.fill === ADVANCED_CHANNEL_ENABLE_COLOR) {
            cmosVal = cmosVal | 2;
        }
        if (advancedSvgDocument.getElementById(`output_ch${chId}_n`).style.fill === ADVANCED_CHANNEL_ENABLE_COLOR) {
            cmosVal = cmosVal | 1;
        }
    }

    return {
        id: chId,
        enable: document.getElementById(`enable${chId}`).checked,
        cmos: cmosVal,
        frequency: document.getElementById(`frequency_ch${chId}`).value,
        coarse_delay: document.getElementById(`coarse_delay_ch${chId}`).value,
        fine_delay: document.getElementById(`fine_delay_ch${chId}`).value
    };
}

function getConnectionStatus() {
    let connectionStatusClass = document.getElementById("synchronaConnectionStatus").className;
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
                document.getElementById("synchronaConnectionMsg").innerHTML = "Connected";
                ret = true;
            } else {
                connectionStatusClass += `${STATUS_DISCONNECTED}`;
                document.getElementById("synchronaConnectionMsg").innerHTML = "Disconnected";
            }
            document.getElementById("synchronaConnectionStatus").className = connectionStatusClass;
            return ret;
        })
        .catch(error => {
            connectionStatusClass += `${STATUS_DISCONNECTED}`;
            document.getElementById("synchronaConnectionStatus").className = connectionStatusClass;
            document.getElementById("synchronaConnectionMsg").innerHTML = "Disconnected";
            console.log(error);
            return false;
        });
}

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function btnStatusClicked() {
    getConnectionStatus();
}

function getChannelData() {
    const url = `http://${ipAddress}:8000/synchrona/channels`;
    return fetch(url)
        .then(handleErrors)
        .then(response => {
            return response.json();
        })
        .then(data => {
            updateValues(data);
        })
        .catch(error => {
            console.log(error);
            return null;
        });
}

function updateValues(data) {
    for (let i = 1; i <= 14; i++) {
        let ch = data[i-1];
        enableChannel(i, ch.enable);
        updateFrequency(i, String(ch.frequency));
        updateDivider(i, ch.divider);
        updateCoarseDelay(i, ch.coarse_delay);
        updateFineDelay(i, ch.fine_delay);
    }
}
