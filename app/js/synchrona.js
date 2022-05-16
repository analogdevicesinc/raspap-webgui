
const STATUS_CONNECTED = 'service-status-up';
const STATUS_LIGHT_CONNECTED ='service-status-light-up'
const STATUS_WARN = 'service-status-warn';
const STATUS_DISCONNECTED = 'service-status-down';

const ADVANCED_CHANNEL_ENABLE_COLOR = 'rgb(44, 107, 27)';
const ADVANCED_CHANNEL_DISABLE_COLOR = 'rgb(166, 31, 31)';
const ADVANCED_RECT_FILL_WHITE  = 'rgb(255, 255, 255)';
const ADVANCED_RECT_STROKE_BLACK  = 'rgb(0, 0, 0)';

const SELECT_STROKE = '0.7px';
const DESELECT_STROKE = '0px';

const SELECT_ROW_COLOR = 'rgb(28, 131, 235)';

let generalSvgElement;
const advancedSvgElement = document.getElementById("synchronaDiagram");

let generalSvgDocument;
let advancedSvgDocument;

let pll2Freq;

let ipAddress = location.host;

let sortableList;
let importedScript = document.createElement('script');
importedScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.10.2/Sortable.min.js';
document.head.appendChild(importedScript);

let selectedChannels = new Set();

// two-outputs non-CMOS channels
[1, 2, 3, 4, 6, 8, 9, 10].forEach( function (chId) {
    document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
});

// two-outpus CMOS channels
[5, 7].forEach( function (chId) {
    document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
});

// one-output channels
for (let chId = 11; chId <= 14; chId++) {
    document.getElementById(`enable${chId}`).addEventListener('click', generalMenuCheckBoxClicked);
}

for (let chId = 1; chId <= 14; chId++) {
    document.getElementById(`frequency_ch${chId}`).addEventListener('change', generalMenuUpdateFrequency);
    document.getElementById(`coarse_delay_ch${chId}`).addEventListener('change', generalMenuUpdateCoarseDelay);
}

document.getElementById('btnselectall').addEventListener('click', selectAll);
document.getElementById('btnselectnone').addEventListener('click', selectNone);
document.getElementById('gen_btnreconfig').addEventListener('click', reloadConfig);
document.getElementById('adv_btnreconfig').addEventListener('click', reloadConfig);

getConnectionStatus();

window.addEventListener('load', loadGeneralSvg, false);

function loadGeneralSvg(){
    generalSvgElement = document.getElementById("synchronaImg");
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

    updateGeneralMenu();
}

advancedSvgElement.addEventListener("load",function(){
    advancedSvgDocument = advancedSvgElement.contentDocument;

    // two-outputs non-CMOS channels
    [1, 2, 3, 4, 9, 10].forEach( function (chId) {
        advancedSvgDocument.getElementById(`output_ch${chId}_p`).addEventListener('click', onCombinedChannelClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_n`).addEventListener('click', onCombinedChannelClicked);
    });

    // two-outpus CMOS channels
    [5, 6, 7, 8].forEach( function (chId) {
        advancedSvgDocument.getElementById(`output_ch${chId}_p`).addEventListener('click', onChannelClicked);
        advancedSvgDocument.getElementById(`output_ch${chId}_n`).addEventListener('click', onChannelClicked);
    });

    // one-output channels
    for (let chId = 11; chId <= 14; chId++) {
        advancedSvgDocument.getElementById(`output_ch${chId}`).addEventListener('click', onChannelClicked);
    }

    // init input
    advancedSvgDocument.getElementById('input_ad9545_internal').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    advancedSvgDocument.getElementById('input_ad9545_internal').style.stroke = ADVANCED_CHANNEL_ENABLE_COLOR;

    for (let chId = 1; chId <= 14; chId++) {
        advancedSvgDocument.getElementById(`frequency_ch${chId}`).addEventListener('change', advancedMenuUpdateFrequency);

        document.getElementById(`coarse_delay_ch${chId}`).addEventListener('change', generalMenuUpdateCoarseDelay);
        advancedSvgDocument.getElementById(`coarse_delay_ch${chId}`).addEventListener('change', advancedMenuUpdateCoarseDelay);

        advancedSvgDocument.getElementById(`fine_delay_ch${chId}`).addEventListener('change', advancedMenuUpdateFineDelay);
    }

    updateAdvancedMenu();

    // workaround in order to load the advanced svg diagram
    document.getElementById("synchronaadvanced").classList.remove('active');
    document.getElementById("synchronaadvanced").classList.add('fade');
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

function enableChannelGeneric(doc, chId, enable) {
    if (1 <= chId && chId <= 10) {
        /*
         * two-outputs channels
         * in this case we treat ch 5 and 7 as the others (not CMOS)
         * the functionality of enabling separately the outputs is available only in the advanced menu
         */
        setChannelState(doc.getElementById(`output_ch${chId}_p`), enable);
        setChannelState(doc.getElementById(`output_ch${chId}_n`), enable);
    } else {
        /*
         * one-outputs channels
         */
        setChannelState(doc.getElementById(`output_ch${chId}`), enable);
    }
}

function enableChannelGeneral(chId, enable) {
    document.getElementById(`enable${chId}`).checked = enable;
    enableChannelGeneric(generalSvgDocument, chId, enable);
}

function enableChannel(chId, enable) {
    enableChannelGeneral(chId, enable);
    enableChannelGeneric(advancedSvgDocument, chId, enable);
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
    return (chId === '5' || chId === '6' || chId === '7' || chId === '8');
}

function setAdvancedSvgRectState(elem, en) {
    if (en) {
        advancedSvgDocument.getElementById(elem).style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
        advancedSvgDocument.getElementById(elem).style.fillOpacity = 0.350242;
        advancedSvgDocument.getElementById(elem).style.stroke = ADVANCED_CHANNEL_ENABLE_COLOR;
    } else {
        advancedSvgDocument.getElementById(elem).style.fill = ADVANCED_RECT_FILL_WHITE;
        advancedSvgDocument.getElementById(elem).style.fillOpacity = 0;
        advancedSvgDocument.getElementById(elem).style.stroke = ADVANCED_RECT_STROKE_BLACK;
    }
}

function setVCXO(vcxo) {
    if (vcxo === 100000000) {
        setAdvancedSvgRectState("VCXO100", true);
        setAdvancedSvgRectState("VCXO122", false);
    } else {
        setAdvancedSvgRectState("VCXO122", true);
        setAdvancedSvgRectState("VCXO100", false);
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

function updateFrequencyGeneric(doc, chId, value) {
    let newValue = toHz(value);
    doc.getElementById(`frequency_ch${chId}`).value = newValue;
}

function updateFrequency(chId, value) {
    updateFrequencyGeneric(document, chId, value);
    updateFrequencyGeneric(advancedSvgDocument, chId, value);
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

function updateCoarseDelayGeneric(doc, chId, value) {
    doc.getElementById(`coarse_delay_ch${chId}`).value = value;
}

function updateCoarseDelay(chId, value) {
    updateCoarseDelayGeneric(document, chId, value);
    updateCoarseDelayGeneric(advancedSvgDocument, chId, value);
}

/*
 * Fine Delay
 */

function fineDelayToDTValue(v) {
    let val = parseInt(v);
    if (val === 0) {
        return 0;
    }
    return ((val - 135)/25) + 1;
}

function fineDelayFromDTValue(val) {
    if (val == 0) {
        return 0;
    }
    return ((val - 1) * 25) + 135
}

function advancedMenuUpdateFineDelay(event) {
    let chId = event.target.id.match(/\d+/)[0];
    let value =  event.target.value;

    updateFineDelay(chId, value);
}

function updateFineDelayGeneric(doc, chId, value) {
    doc.getElementById(`fine_delay_ch${chId}`).value = value;
}

function updateFineDelay(chId, value) {
    updateFineDelayGeneric(advancedSvgDocument, chId, value);
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

function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function validateFields() {
    for (let chId = 1; chId <= 14; chId++) {
        if (!isNumeric(document.getElementById(`frequency_ch${chId}`).value)) {
            alert(`Frequency of channel ${chId} not a number`);
            return false;
        }
        if (!isNumeric(document.getElementById(`coarse_delay_ch${chId}`).value)) {
            alert(`Coarse delay of channel ${chId} not a number`);
            return false;
        }
        if (!isNumeric(advancedSvgDocument.getElementById(`fine_delay_ch${chId}`).value)) {
            alert(`Fine delay of channel ${chId} not a number`);
            return false;
        }
    }
    return true;
}

function reloadConfig() {
    if (!validateFields()) {
        return;
    }

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
                alert("Unknown error! No data returned from the server...");
            } else if (json.errno_str.length) {
                alert(json.errno_str);
            } else {
                setVCXO(json.vcxo);
                for (let i = 1; i <= 14; i++) {
                    updateDivider(i, json.channels[i-1].divider);
                }
            }
            loadingButton(document.getElementById("gen_btnreconfig"), false);
            loadingButton(document.getElementById("adv_btnreconfig"), false);
            console.info('Synchrona updated');
            getConnectionStatus();
        }).
        catch(function(error) {
            console.error('Reload failed', error)
            loadingButton(document.getElementById("gen_btnreconfig"), false);
            loadingButton(document.getElementById("adv_btnreconfig"), false);
            getConnectionStatus();
        });
}

function getJSON() {
    let channels_data = [];
    for (let chId = 1; chId <= 14; chId++) {
        channels_data.push(getChannelJSON(chId));
    }

    let usecase = "default";
    if (document.getElementById('cbxusecase').value == "1PPS") {
        usecase = "zerodelay";
    }
    return JSON.stringify({
        vcxo: getVCXO(),
        mode: usecase,
        input_priority: getInputPriority(),
        channels: channels_data,
    });
}

function getVCXO() {
    if ( advancedSvgDocument.getElementById("VCXO100").style.fill === ADVANCED_CHANNEL_ENABLE_COLOR) {
        return 100000000;
    }
    return 122880000;
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
    if (chId === 5 || chId === 6 || chId === 7 || chId === 8) {
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
        coarse_delay: (Math.round((document.getElementById(`coarse_delay_ch${chId}`).value * 2 * pll2Freq) / Math.pow(10,12), 10)),
        fine_delay: fineDelayToDTValue(advancedSvgDocument.getElementById(`fine_delay_ch${chId}`).value)
    };
}

function getConnectionStatus() {
    let connectionStatusClass = document.getElementById("synchronaConnectionStatus").className;
    connectionStatusClass = connectionStatusClass.replace(`${STATUS_CONNECTED}` , '');
    connectionStatusClass = connectionStatusClass.replace(`${STATUS_DISCONNECTED}` , '');

    let synchronaDtClass = document.getElementById("synchronaDtStatus").className;
    synchronaDtClass = synchronaDtClass.replace(`${STATUS_CONNECTED}` , '');
    synchronaDtClass = synchronaDtClass.replace(`${STATUS_WARN}` , '');
    synchronaDtClass = synchronaDtClass.replace(`${STATUS_DISCONNECTED}` , '');

    let clkRefClass = document.getElementById("synchronaRefInputStatus").className;
    clkRefClass = clkRefClass.replace(`${STATUS_CONNECTED}`, '');
    clkRefClass = clkRefClass.replace(`${STATUS_LIGHT_CONNECTED}`, '');
    clkRefClass = clkRefClass.replace(`${STATUS_WARN}`, '');
    clkRefClass = clkRefClass.replace(`${STATUS_DISCONNECTED}`, '');

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
                document.getElementById("debugsynchronastatusfield").innerHTML = data.message;
                ret = true;
            } else {
                connectionStatusClass += `${STATUS_DISCONNECTED}`;
                document.getElementById("synchronaConnectionMsg").innerHTML = "Disconnected";
                document.getElementById("debugsynchronastatusfield").innerHTML = "Disconnected";
            }
            document.getElementById("synchronaConnectionStatus").className = connectionStatusClass;

            if (data.dt_status === '2') {
                synchronaDtClass += `${STATUS_CONNECTED}`;
                document.getElementById("synchronaDtMsg").innerHTML = "Devicetree loaded";
            } else if (data.dt_status === '1') {
                synchronaDtClass += `${STATUS_WARN}`;
                document.getElementById("synchronaDtMsg").innerHTML = "The current devicetree is not loaded";
            } else {
                synchronaDtClass += `${STATUS_DISCONNECTED}`;
                document.getElementById("synchronaDtMsg").innerHTML = "No devicetree loaded";
            }
            document.getElementById("synchronaDtStatus").className = synchronaDtClass;

            document.getElementById("synchronaRefInput").innerHTML = data.input_ref;

            if (data.pll_locked) {
                if (data.input_ref == "OCXO") {
                    clkRefClass += `${STATUS_LIGHT_CONNECTED}`;
                } else if(data.input_ref == "Holdover") {
                    clkRefClass += `${STATUS_WARN}`;
                    alert("Holdover mode on! This means that a valid reference was lost... \
Press 'Reload config' if you want to switch to the internal OCXO.")
                } else {
                    clkRefClass += `${STATUS_CONNECTED}`
                }
            } else {
                clkRefClass += `${STATUS_DISCONNECTED}`;
            }
            document.getElementById("synchronaRefInputStatus").className = clkRefClass;

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

function getSynchronaData() {
    const url = `http://${ipAddress}:8000/synchrona/channels`;
    return fetch(url)
        .then(handleErrors)
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.log(error);
            return null;
        });
}

function updateGeneralMenu() {
    getSynchronaData()
    .then(data => {
        if (data == null) {
            return false;
        }
        updateValuesGeneral(data);
        return true;
    });
}

function updateAdvancedMenu() {
    getSynchronaData()
    .then(data => {
        if (data == null) {
            return false;
        }
        updateValuesAdvanced(data);
        return true;
    });
}

function updateCoarseDelayRange(doc, chId, pll2Freq) {
    doc.getElementById(`coarse_delay_ch${chId}`).min = 0;
    doc.getElementById(`coarse_delay_ch${chId}`).max = 17 * parseInt((Math.pow(10, 12)) / (2 * pll2Freq),10);
    doc.getElementById(`coarse_delay_ch${chId}`).step = parseInt(Math.pow(10, 12) / (2 * pll2Freq), 10);
}

function updateValuesGeneral(data) {
    pll2Freq = data["channels"][0].frequency * data["channels"][0].divider;
    for (let i = 1; i <= 14; i++) {
        let ch = data["channels"][i-1];
        document.getElementById(`mode${i}`).textContent = ch.mode;
        enableChannelGeneral(i, ch.enable);
        updateFrequencyGeneric(document, i, String(ch.frequency));
        updateCoarseDelayGeneric(document, i, ch.coarse_delay * (parseInt((Math.pow(10, 12) / (2 * pll2Freq)), 10)));
        updateCoarseDelayRange(document, i, pll2Freq);
    }
}

function update_input_priorities(priorities) {
    let sorted_elem = document.getElementById('sortedElement');

    if (priorities.length != 4) {
        alert("Input List must have 4 elements! Cannot update input priority list. \
Consider restarting your devicetree in the Debug tab...");
        return;
    }

    for (let to = 0; to < priorities.length; to++) {
        for (let from = 0; from < sorted_elem.childElementCount && to < sorted_elem.childElementCount; from++) {
            if (priorities[to] == sorted_elem.children[from].id && to != from) {
                /* do the swap */
                tmp_child = sorted_elem.children[to].cloneNode(true)

                sorted_elem.children[to].replaceWith(sorted_elem.children[from])
                sorted_elem.appendChild(tmp_child)
            }
        }
    }
}

function update_input_references_status(vcxo, pps, ref_in) {
    input_ref = document.getElementById("synchronaRefInput").innerHTML;
    pll_locked = false;

    if(document.getElementById("synchronaRefInputStatus").className.includes(STATUS_CONNECTED)) {
        pll_locked = true;
    }

    if (ref_in) {
        advancedSvgDocument.getElementById('input_ad9545_ref_in').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    } else {
        advancedSvgDocument.getElementById('input_ad9545_ref_in').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    }

    if (pps) {
        advancedSvgDocument.getElementById('input_ad9545_pps').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    } else {
        advancedSvgDocument.getElementById('input_ad9545_pps').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    }

    if (input_ref == "REF_CLK" && pll_locked) {
        advancedSvgDocument.getElementById('input_hmc7044_ch2_p').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
        advancedSvgDocument.getElementById('input_hmc7044_ch2_n').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
        return
    } else {
        advancedSvgDocument.getElementById('input_hmc7044_ch2_p').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
        advancedSvgDocument.getElementById('input_hmc7044_ch2_n').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    }

    if (input_ref == "P_CH3" && pll_locked) {
        advancedSvgDocument.getElementById('input_hmc7044_ch3_p').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
        advancedSvgDocument.getElementById('input_hmc7044_ch3_n').style.fill = ADVANCED_CHANNEL_ENABLE_COLOR;
    } else {
        advancedSvgDocument.getElementById('input_hmc7044_ch3_p').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
        advancedSvgDocument.getElementById('input_hmc7044_ch3_n').style.fill = ADVANCED_CHANNEL_DISABLE_COLOR;
    }

    setAdvancedSvgRectState("TCXO40", false);
    setAdvancedSvgRectState("TCXO38", false);
    if (input_ref == "TCXO" && pll_locked) {
        if (vcxo == 122880000) {
            setAdvancedSvgRectState("TCXO38", true);
        } else {
            setAdvancedSvgRectState("TCXO40", true);
        }
    }
}

function updateValuesAdvanced(data) {
    pll2Freq = data["channels"][0].frequency * data["channels"][0].divider;

    if (data["mode"] === "zerodelay") {
        document.getElementById('cbxusecase').value = "1PPS";
        changeUsecase();
    } else {
        document.getElementById('cbxusecase').value = "50MHz";
        changeUsecase();
    }

    for (let i = 1; i <= 14; i++) {
        let ch = data["channels"][i-1];
        enableChannelGeneric(advancedSvgDocument, i, ch.enable);
        updateFrequencyGeneric(advancedSvgDocument, i, String(ch.frequency));
        updateDivider(i, ch.divider);
        updateCoarseDelayGeneric(advancedSvgDocument, i, ch.coarse_delay * (parseInt((Math.pow(10, 12) / (2 * pll2Freq)), 10)));
        updateCoarseDelayRange(advancedSvgDocument, i, pll2Freq);
        updateFineDelayGeneric(advancedSvgDocument, i, fineDelayFromDTValue(ch.fine_delay));
    }
    setVCXO(data["vcxo"]);
    update_input_priorities(data["input_priorities"])
    update_input_references_status(data["vcxo"], data["pps"], data["ref_in"]);
}

function setInputPriorityVisibility(id, visible) {
    let children = document.getElementById('sortedElement').childNodes;
    for (let x in children) {
        if (children[x].id === id) {
            if (visible === true) {
                children[x].style.display = ""
            } else {
                children[x].style.display = "none"
            }
        }
    }
}

function changeUsecase() {
    let usecase = document.getElementById('cbxusecase').value;
    switch (usecase) {
        case "50MHz":
            setInputPriorityVisibility("ref_clk", true);
            setInputPriorityVisibility("tcxo", true);
            document.getElementById('synchronize').style.display = "none"
            break;
        case "1PPS":
            setInputPriorityVisibility("ref_clk", false);
            setInputPriorityVisibility("tcxo", false);
            document.getElementById('synchronize').style.display = "block"
            break;
    }
}
