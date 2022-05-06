const HTML_TEMP =
    '<span class="singleMapSpan"><div class = "nameDiv">dsd</div><div class = "borderDiv"><canvas></canvas></div></span>';

var mapList = [];
var mapIndex = 0;

function onBodyLoad() {
    let listData = { start: 0, limit: 12 };
    axios({
        url: URL_LIST_MAP,
        method: 'get',
        params: listData,
    }).then(res => {
        mapList = res.data.data.data;
        drawHtml(mapList);
    });
}

function drawHtml(mapDataList) {
    for (let mapData of mapDataList) {
        let span = $(HTML_TEMP);
        $('#exhibition').append(span);

        //设置名字
        span.find('.nameDiv').text(mapData.name);

        let canvas = span.find('canvas')[0];
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        let ctx = canvas.getContext('2d');

        drawMap(ctx, JSON.parse(mapData.map));
    }

    //初始化设置index为选中状态
    updateIndexActive();
}

/**
 *  在一个canvas ctx上绘制地图
 * @param  ctx
 * @param  map
 */
function drawMap(ctx, map) {
    for (let i in map) {
        for (let j in map[i]) {
            if (map[i][j] == ITEM_NONE) {
                continue;
            }

            let scene = SceneItem.valueOfByType(map[i][j], i, j);
            scene.draw(ctx);
        }
    }
}

function onKeyDown(event) {
    let code = event.code;
    if (code == 'KeyW' || code == 'ArrowUp') {
        mapIndex = mapIndex - 4 < 0 ? mapIndex : mapIndex - 4;
    } else if (code == 'KeyS' || code == 'ArrowDown') {
        mapIndex = mapIndex + 4 >= mapList.length ? mapIndex : mapIndex + 4;
    } else if (code == 'KeyA' || code == 'ArrowLeft') {
        mapIndex = mapIndex - 1 < 0 ? mapIndex : mapIndex - 1;
    } else if (code == 'KeyD' || code == 'ArrowRight') {
        mapIndex = mapIndex + 1 >= mapList.length ? mapIndex : mapIndex + 1;
    }
    updateIndexActive();

    if (code == 'Escape' || code == 'Enter') {
        window.location.href = '../../index.html';
    }
}

function updateIndexActive() {
    $('.borderDiv').removeClass('active');
    $('.borderDiv').eq(mapIndex).addClass('active');
}
