
const ENABLE_BLOCK_COLOR = '#72727200';
const DISABLE_BLOCK_COLOR = '#727272a6';

const SELECT_STROKE_INPUT = '0.7px'
const DESELECT_STROKE_INPUT = '0px';

var lastConfigOpen = null;

window.onload = function () {
    svgDocument = window.top.document.getElementById("synchronaDiagram").contentDocument;
    htmlDocument = window.top.document;

    htmlDocument.getElementById("cbxinputasd").value = "50MHz";
    htmlDocument.getElementById("cbxinputasd").onchange();

    htmlDocument.getElementById("pllsbypas").onclick();

}

function inputChanged() {
    let selectedInput = htmlDocument.getElementById("cbxinputasd").value;

    switch (selectedInput) {
        case "50MHz":
            svgDocument.getElementById("TCXO_Group").style.display = "none";
            svgDocument.getElementById("refInSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("ppsSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("input50Selected").style.strokeWidth = SELECT_STROKE_INPUT;
            svgDocument.getElementById("tcxoSelected").style.strokeWidth = DESELECT_STROKE_INPUT;

            svgDocument.getElementById("TCXO40").style.fillOpacity = 0;
            svgDocument.getElementById("TCXO38").style.fillOpacity = 0;
            break;
        case "1PPS":
            svgDocument.getElementById("TCXO_Group").style.display = "none";
            svgDocument.getElementById("refInSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("ppsSelected").style.strokeWidth = SELECT_STROKE_INPUT;
            svgDocument.getElementById("input50Selected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("tcxoSelected").style.strokeWidth = DESELECT_STROKE_INPUT;

            svgDocument.getElementById("TCXO40").style.fillOpacity = 0;
            svgDocument.getElementById("TCXO38").style.fillOpacity = 0;
            break;
        case "10MHz":
            svgDocument.getElementById("TCXO_Group").style.display = "none";
            svgDocument.getElementById("refInSelected").style.strokeWidth = SELECT_STROKE_INPUT;
            svgDocument.getElementById("ppsSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("input50Selected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("tcxoSelected").style.strokeWidth = DESELECT_STROKE_INPUT;

            svgDocument.getElementById("TCXO40").style.fillOpacity = 0;
            svgDocument.getElementById("TCXO38").style.fillOpacity = 0;
            break;
        case "AD9545 disabled":
            svgDocument.getElementById("TCXO_Group").style.display = "block";
            svgDocument.getElementById("refInSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("ppsSelected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("input50Selected").style.strokeWidth = DESELECT_STROKE_INPUT;
            svgDocument.getElementById("tcxoSelected").style.strokeWidth = SELECT_STROKE_INPUT;

            svgDocument.getElementById("TCXO40").style.fillOpacity = 0;
            svgDocument.getElementById("TCXO38").style.fillOpacity = 0.6;
            break;

    }
}

function enableBypass() {
    let bypassEnabled = htmlDocument.getElementById("pllsbypas").checked;

    if (bypassEnabled === true) {
        svgDocument.getElementById("PLLbypass").style.display = "block";
    } else {
        svgDocument.getElementById("PLLbypass").style.display = "none";
    }
}

function vcxoChanged(currentVCXO) {
    if (currentVCXO === "VCXO100") {
        svgDocument.getElementById("VCXO100").style.fillOpacity = 0;
        svgDocument.getElementById("VCXO122").style.fillOpacity = 0.6;
    } else {
        svgDocument.getElementById("VCXO100").style.fillOpacity = 0.6;
        svgDocument.getElementById("VCXO122").style.fillOpacity = 0;
    }
}

function tcxoChanged(currentTCXO) {
    if (currentTCXO === "TCXO40") {
        svgDocument.getElementById("TCXO40").style.fillOpacity = 0;
        svgDocument.getElementById("TCXO38").style.fillOpacity = 0.6;
    } else {
        svgDocument.getElementById("TCXO40").style.fillOpacity = 0.6;
        svgDocument.getElementById("TCXO38").style.fillOpacity = 0;
    }
}

function componentClicked(idComp) {
    switch (idComp) {
        case "PLL1Comp":
            if (lastConfigOpen !== null) {
                htmlDocument.getElementById(lastConfigOpen).style.display = "none";
            }
            lastConfigOpen = "pll1Config";
            htmlDocument.getElementById("pll1Config").style.display = "block";
            break;
        case "PLL2Comp":
            if (lastConfigOpen !== null) {
                htmlDocument.getElementById(lastConfigOpen).style.display = "none";
            }
            lastConfigOpen = "pll2Config";
            htmlDocument.getElementById("pll2Config").style.display = "block";
            break;
        case "TermOpt1":
            if (lastConfigOpen !== null) {
                htmlDocument.getElementById(lastConfigOpen).style.display = "none";
            }
            lastConfigOpen = "tempOpt1";
            htmlDocument.getElementById("tempOpt1").style.display = "block";
            break;
    }
}