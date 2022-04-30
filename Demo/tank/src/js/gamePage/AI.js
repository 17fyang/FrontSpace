const MAP_REACHABLE = 0;
const MAP_UNRECHABLE = 1;

class AiGrid {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.g = undefined;
        this.h = undefined;
        this.parent = undefined;
    }

    reachable() {
        return this.type == MAP_REACHABLE;
    }

    resetContext(startGrid, endGrid, parentGrid) {
        this.g = Math.abs(this.x - startGrid.x) + Math.abs(this.y - startGrid.y);
        this.h = Math.abs(this.x - endGrid.x) + Math.abs(this.y - endGrid.y);
        this.parent = parentGrid;
    }

    traceParent() {
        let temp = this;
        let result = [];
        while (temp.parent != undefined) {
            result.push(temp);
            temp = temp.parent;
        }
        return result;
    }
}

class AiMap {
    /**
     * 从场景地图中解析一份ai地图对象
     * @param {*} sceneMap
     */
    constructor(sceneMap) {
        //TODO增加地图静态元素变动监听
        this.map = [];

        if (sceneMap == undefined) {
            return;
        }

        for (let i = 0; i < sceneMap.length; i++) {
            for (let j = 0; j < sceneMap[i].length; j++) {
                let item = sceneMap[i][j];

                let aiLoc = MapUtil.sceneToAi({ x: i, y: j });
                if (this.map[aiLoc.x] == undefined) {
                    this.map[aiLoc.x] = [];
                }

                let hasCollision = item != undefined && item.collision() != NONE_COLLISION;
                let gridType = hasCollision ? MAP_UNRECHABLE : MAP_REACHABLE;
                if (this.map[aiLoc.x][aiLoc.y] == undefined) {
                    //aiMap上没有这个aiGrid则创建一个
                    this.map[aiLoc.x][aiLoc.y] = new AiGrid(aiLoc.x, aiLoc.y, gridType);
                } else if (gridType == MAP_UNRECHABLE) {
                    //aiMap上有这个aiGrid则校验格子对应场景格子是否有任意一个不可达
                    this.map[aiLoc.x][aiLoc.y].type = gridType;
                }
            }
        }
    }

    /**
     * 获取一个位置的格子
     * @param {Number} x
     * @param {Number} y
     * @returns {AiGrid}
     */
    get(x, y) {
        if (x < 0 || x >= this.map.length || y < 0 || y >= this.map[x].length) {
            return undefined;
        }
        return this.map[x][y];
    }

    /**
     * 深拷贝一份地图对象
     * @returns AiMap
     */
    deepClone() {
        let copyMap = new AiMap();
        for (let entry of this.map.entries()) {
            copyMap.map[entry[0]] = [];
            for (let grid of entry[1]) {
                copyMap.map[entry[0]].push(new AiGrid(grid.x, grid.y, grid.type));
            }
        }
        return copyMap;
    }
    /**
     * 周围能到达的格子
     * @param {Number} x
     * @param {Number} y
     */
    arroundGrid(x, y) {
        let arroundList = [];
        let candidate = [
            this.get(x - 1, y),
            this.get(x + 1, y),
            this.get(x, y - 1),
            this.get(x, y + 1),
        ];

        for (let grid of candidate) {
            if (grid != undefined && grid.reachable()) {
                arroundList.push(grid);
            }
        }
        return arroundList;
    }
}

class TankAi {
    constructor(aiMap, tank) {
        this.aiMap = aiMap;

        //默认ai坦克一直都是在移动的
        tank.position.moving = true;
        this.tank = tank;
        this.tickTime = 0;
        this.futureRoad = []; //坦克的决策路径[AiGrid]

        //添加撞到墙的监听
        eventHandler.addItemCollideEventListener(this.tank, event => this.aiCollideHandler(event));
        eventHandler.addBorderCollideEventListener(this.tank, event =>
            this.aiCollideHandler(event)
        );

        //初始时做一次决策并做一次移动反应
        while (this.futureRoad.length == 0) {
            this.decisionTick();
            this.moveReact();
        }
    }

    tick() {
        this.tickTime++;

        //前面没路走了或者时间到了做一次决策
        while (this.futureRoad.length == 0 || this.tickTime >= 1000) {
            this.decisionTick();
            this.moveReact();
            this.tickTime = 0;
        }

        let nextGrid = this.futureRoad[0];
        let tankLocation = MapUtil.canvasToAi(this.tank.position.location());
        if (nextGrid.x == tankLocation.x && nextGrid.y == tankLocation.y) {
            this.futureRoad.shift();
        }

        //TODO 如果下一个格子不在坦克的行驶方向上，需要做一次移动反应

        //TODO 坦克有可能到不了那个点就拐弯了，要清除决策
        if (nextGrid.x != tankLocation.x && nextGrid.y != tankLocation.y) {
            this.decisionTick();
            this.moveReact();
            this.tickTime = 0;
        }
    }

    /**
     * 一次移动反应
     */
    moveReact() {
        let nextGrid = this.futureRoad[0];
        let tankLocation = MapUtil.canvasToAi(this.tank.position.location());

        let direct = DIRECT_UP;
        if (nextGrid.x == tankLocation.x) {
            direct = nextGrid.y > tankLocation.y ? DIRECT_DOWN : DIRECT_UP;
        } else if (nextGrid.y == tankLocation.y) {
            direct = nextGrid.x > tankLocation.x ? DIRECT_RIGHT : DIRECT_LEFT;
        }
        this.tank.moveControl(direct, undefined);
    }

    /**
     * aiTank碰撞到静态元素的行为
     * @param {*} event
     */
    aiCollideHandler(event) {
        //做一次移动反应
        this.moveReact();

        //TODO临时代码
        this.tank.moveControl(undefined, true);
    }

    /**
     * 做决策的tick
     */
    decisionTick() {
        let startAi = MapUtil.canvasToAi(this.tank.position.location());

        let findPoint = this.findPoint();
        this.futureRoad = this.findPath(startAi.x, startAi.y, findPoint.x, findPoint.y);
    }

    /**
     * 寻点算法
     * @returns [x,y]
     */
    findPoint() {
        let width = this.aiMap.map.length;
        let height = this.aiMap.map[0].length;

        let tryTimes = 10;
        let point = {};
        while (tryTimes-- > 0) {
            let x = Math.floor(Math.random() * width);
            let y = Math.floor(Math.random() * height);
            point = { x: x, y: y };
            if (this.aiMap.get(x, y).reachable()) {
                return point;
            }
        }

        //超过了尝试次数直接返回不可达的点
        return point;
    }

    /**
     * 寻路算法
     * @param {Number} aimX
     * @param {Number} aimY
     * @returns
     */
    findPath(startX, satrtY, aimX, aimY) {
        let copyMap = this.aiMap.deepClone();

        let aim = copyMap.get(aimX, aimY);
        let start = copyMap.get(startX, satrtY);
        let openList = [start];
        let closeList = [];
        while (openList.length != 0) {
            openList.sort((a, b) => getF(a) - getF(b));
            let foundReachable = false;
            let min = openList.pop();
            closeList.push(min);
            let reachableGrids = copyMap.arroundGrid(min.x, min.y);
            for (let grid of reachableGrids) {
                if (closeList.indexOf(grid) == -1 && openList.indexOf(grid) == -1) {
                    grid.resetContext(start, aim, min);
                    openList.push(grid);
                    foundReachable = true;
                }

                //找到目的地了，记录路径并返回
                if (grid == aim) {
                    return grid.traceParent().reverse();
                }
            }

            //无路可走了，记录路径并返回
            if (!foundReachable) {
                closeList.shift();
                return closeList;
            }
        }
        //没找到路
        return [];

        function getF(grid) {
            return grid.g + grid.h;
        }
    }
}
