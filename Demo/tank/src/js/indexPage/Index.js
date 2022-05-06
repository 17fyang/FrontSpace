const INDEX_DRAW_MAP = 0;
const INDEX_CHOICE_MAP = 1;
const INDEX_START_GAME = 2;

let interactionDiv = document.getElementsByClassName('interactionDiv')[0];
let tankSpanList = document.getElementsByClassName('tankSpan');
let currentIdx = INDEX_START_GAME;
setTankIndex(currentIdx);

/**
 *  设置坦克光标当前的位置
 * @param {Number} nextIdx
 * @returns
 */
function setTankIndex(nextIdx) {
    if (nextIdx == undefined || nextIdx == currentIdx) {
        return;
    }

    tankSpanList[nextIdx].innerHTML = tankSpanList[currentIdx].innerHTML;
    tankSpanList[currentIdx].innerHTML = '';
    currentIdx = nextIdx;
}

/**
 *  键盘点击事件
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
    let code = event.code;

    if (code == 'KeyW' || code == 'ArrowUp') {
        let nextIdx = currentIdx <= 0 ? tankSpanList.length - 1 : currentIdx - 1;
        setTankIndex(nextIdx);
    } else if (code == 'KeyS' || code == 'ArrowDown') {
        let nextIdx = currentIdx >= tankSpanList.length - 1 ? 0 : currentIdx + 1;
        setTankIndex(nextIdx);
    } else if (code == 'Enter') {
        onEnter();
    }
}

function onEnter() {
    if (currentIdx == INDEX_DRAW_MAP) {
        window.location.href = 'src/html/drawMap.html';
    } else if (currentIdx == INDEX_CHOICE_MAP) {
        window.location.href = 'src/html/chooseMap.html';
    } else if (currentIdx == INDEX_START_GAME) {
        window.location.href = 'src/html/game.html';
    }
}
