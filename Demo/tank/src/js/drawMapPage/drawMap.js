const DRAW_PIXEL_NUM = 2; //在绘制场景下，最小单元为2*2个地图格子

new Vue({
    el: '#app',
    data: function () {
        return { visible: false, radio: '2', input: '' };
    },
});

initCanvas();
var isDrawing = false; //画笔状态，鼠标左键是否处于按下状态
var map = []; //地图数据
for (let i = 0; i < MAP_WIDTH; i++) {
    map[i] = [];
    for (let j = 0; j < MAP_HEIGHT; j++) {
        map[i][j] = ITEM_NONE;
    }
}

/**
 * 初始化画布Canvas
 */
function initCanvas() {
    let canvas = document.getElementById('drawCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        onMouseMove(ctx, e);
    });
    canvas.addEventListener('mouseup', e => {
        isDrawing = false;
    });
    canvas.addEventListener('mousemove', e => {
        onMouseMove(ctx, e);
    });
}

/**
 * 鼠标移动事件监听
 */
function onMouseMove(ctx, event) {
    if (isDrawing === false) {
        return;
    }

    //鼠标在canvas对象上的位置
    let canvasPoint = MapUtil.canvasPoint(ctx.canvas, event.offsetX, event.offsetY);
    //鼠标位置对应的地图格子
    let mapPoint = MapUtil.canvasToMap([canvasPoint.x, canvasPoint.y]);
    //鼠标位置对应的最小绘制单元格子
    let drawPoint = {
        x: parseInt(mapPoint.x / DRAW_PIXEL_NUM),
        y: parseInt(mapPoint.y / DRAW_PIXEL_NUM),
    };

    for (let i = drawPoint.x * DRAW_PIXEL_NUM; i < (drawPoint.x + 1) * DRAW_PIXEL_NUM; i++) {
        for (let j = drawPoint.y * DRAW_PIXEL_NUM; j < (drawPoint.y + 1) * DRAW_PIXEL_NUM; j++) {
            if (map[i][j] == ITEM_NONE) {
                let canvasPixel = MapUtil.mapToCanvas([i, j]);
                ctx.fillRect(canvasPixel.x, canvasPixel.y, PIXEL_NUM, PIXEL_NUM);
                map[i][j] = ITEM_WALL;
            }
        }
    }
}
