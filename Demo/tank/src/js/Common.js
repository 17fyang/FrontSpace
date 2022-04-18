const MAP_WIDTH = 24 * 4;
const MAP_HEIGHT = 16 * 4;

const PIXEL_NUM = 10; //一个canvas对应地图格子的像素倍数
const CANVAS_WIDTH = PIXEL_NUM * MAP_WIDTH;
const CANVAS_HEIGHT = PIXEL_NUM * MAP_HEIGHT;

//地图静态元素枚举
const ITEM_NONE = -1;
const ITEM_WALL = 1;
