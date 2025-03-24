/**
 * 
 */

function displaySuccessMessages(divId, dispStrongMessage, dispMessage) {
    if (dispMessage == "" || dispMessage == null || dispMessage == undefined || dispMessage == "undefined") {
        dispMessage = "";
    }
    $("#" + divId).text("").append('<div><center><strong>' + dispStrongMessage + '!</strong><center>' + dispMessage + '</div>');
}

function clearSuccessMessageAfterTwoSecond(MsgDivID) {
    setTimeout(function () {
        $("#" + MsgDivID).text("");
    }, 2100);
}
function clearSuccessMessageAfterThreeSecond(MsgDivID) {
    setTimeout(function () {
        $("#" + MsgDivID).text("");
    }, 2100);
}

function clearSuccessMessageAfterFiveSecond(MsgDivID) {
    setTimeout(function () {
        $("#" + MsgDivID).text("");
    }, 5000);
}

function clearSuccessMessageAfterTenSecond(MsgDivID) {
    setTimeout(function () {
        $("#" + MsgDivID).text("");
    }, 10000);
}

function showElementAfterFiveSecond(divId) {
    setTimeout(function () {
        $("#" + divId).show();
    }, 5000);
}

function hideElement(divId) {
    $("#" + divId).hide();
}

function showElement(divId) {
    $("#" + divId).show();
}

function singleSpaceTrim(obj) {
	obj.value = obj.value.replace(/  +/g, ' ');
}

function showElementAfterFifteenSecond(divId) {
    setTimeout(function () {
        $("#" + divId).show();
    }, 15000);
}
function clearSuccessMessageAfterFifteenSecond(MsgDivID) {
    setTimeout(function () {
        $("#" + MsgDivID).text("");
    }, 15000);
}
