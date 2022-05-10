const MAP_REACHABLE = 0;
const MAP_UNRECHABLE = 1;

const TANK_WIDTH = 4; //坦克宽度：4个地图格子
const TANK_HEIGHT = 4; //坦克高度：4个地图格子

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

                if (this.map[i] == undefined) {
                    this.map[i] = [];
                }

                let hasCollision = item != undefined && item.collision() != NONE_COLLISION;
                let gridType = hasCollision ? MAP_UNRECHABLE : MAP_REACHABLE;
                this.map[i][j] = new AiGrid(i, j, gridType);
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
     * 清除一个位置的格子
     * @param {Number} x
     * @param {Number} y
     */
    remove(x, y) {
        let grid = this.map[x][y];
        if (grid) {
            grid.type = MAP_REACHABLE;
        }
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
            [DIRECT_UP.grid.x + x, DIRECT_UP.grid.y + y],
            [DIRECT_DOWN.grid.x + x, DIRECT_DOWN.grid.y + y],
            [DIRECT_LEFT.grid.x + x, DIRECT_LEFT.grid.y + y],
            [DIRECT_RIGHT.grid.x + x, DIRECT_RIGHT.grid.y + y],
        ];
        //TODO 想法记录：
        //1、怎么处理两个实体相撞？真实遍历实体列表，只处理调用方实体，用调用方的nextTick和被调用方的tick比较
        //2、怎么让坦克按路径走，判断nowTick和nextTick是否在同一个格子，否：判断nextTick是否在下个路径格子中，否：判断是否被fix过，是：moveReact

        for (let point of candidate) {
            if (tankReachable(this, TANK_HEIGHT, TANK_WIDTH, point[0], point[1])) {
                let grid = this.get(point[0], point[1]);
                if (grid != undefined) {
                    arroundList.push(grid);
                }
            }
        }
        return arroundList;

        //到达一个格子指的是坦克左上角到达一个格子，一个格子是否能到达的判定方法：坦克走过之后新的坦克位置格子全都是可到达的
        function tankReachable(aiMap, height, width, x, y) {
            for (let i = x; i < x + width; i++) {
                for (let j = y; j < y + height; j++) {
                    let grid = aiMap.get(i, j);
                    if (grid == undefined || !grid.reachable()) {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}

class TankAi {
    constructor(aiMap, tank) {
        this.aiMap = aiMap;
        this.tank = tank;
        this.tickTime = 0;
        this.futureRoad = []; //坦克的决策路径[AiGrid]

        //添加撞到墙的监听
        eventHandler.addItemCollideEventListener(this.tank, event => this.aiCollideHandler(event));
        eventHandler.addBorderCollideEventListener(this.tank, event =>
            this.aiCollideHandler(event)
        );
    }

    tick() {
        this.tickTime++;

        //前面没路走了或者时间到了做一次决策
        if (this.futureRoad.length == 0 || this.tickTime >= 1000) {
            this.makeDecision();
            this.tickTime = 0;
        }

        let now = MapUtil.canvasToScene(this.tank.position.location());
        let direct = this.tank.position.direct;
        let next = { x: direct.grid.x + now.x, y: direct.grid.y + now.y };

        //如果坦克当前格子和规划格子一致，则表示坦克刚到达这个格子，删除规划格子
        let future = this.futureRoad[0];
        if (future.x == now.x && future.y == now.y) {
            this.futureRoad.shift();
        }

        //TODO这样实现会导致左上拐弯的时候瞬间跳一个格子，暂时不解决
        //如果当前格子和下一个规划的格子不一致，则需要做一次移动反应
        let vertical = (direct == DIRECT_UP || direct == DIRECT_DOWN) && future.x != next.x;
        let horizontal = (direct == DIRECT_LEFT || direct == DIRECT_RIGHT) && future.y != next.y;
        future = this.futureRoad[0];
        if (this.futureRoad.length != 0 && (vertical || horizontal)) {
            this.moveReact();
        }
    }

    /**
     * 一次移动反应
     */
    moveReact() {
        let nextGrid = this.futureRoad[0];
        let tankLocation = MapUtil.canvasToScene(this.tank.position.location());

        let direct = undefined;
        if (nextGrid.x == tankLocation.x && nextGrid.y == tankLocation.y) {
            return;
        } else if (nextGrid.x == tankLocation.x) {
            direct = nextGrid.y > tankLocation.y ? DIRECT_DOWN : DIRECT_UP;
        } else if (nextGrid.y == tankLocation.y) {
            direct = nextGrid.x > tankLocation.x ? DIRECT_RIGHT : DIRECT_LEFT;
        }

        //修正坦克的当前位置
        this.tank.fixFullLocation();

        //控制坦克的移动方向
        this.tank.moveControl(direct, true);
    }

    /**
     * aiTank碰撞到静态元素的行为
     * @param {*} event
     */
    aiCollideHandler(event) {
        // this.moveReact();
    }

    /**
     * 做一次决策
     */
    makeDecision() {
        let start = MapUtil.canvasToScene(this.tank.position.location());

        let init = true;
        while (init || this.futureRoad.length == 0) {
            let findPoint = this.findPoint();
            this.futureRoad = this.findPath(start.x, start.y, findPoint.x, findPoint.y);
            init = false;
        }

        //做一次移动反应
        this.moveReact();
    }

    /**
     * 寻点算法
     * @returns { x: x, y: y }
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
        //深拷贝一份地图对象
        let copyMap = this.aiMap.deepClone();

        let aim = copyMap.get(aimX, aimY);
        let start = copyMap.get(startX, satrtY);
        let openList = [start];
        let closeList = [];
        while (openList.length != 0) {
            //排序，有限按F排序，F相同时按H排序
            openList.sort((a, b) => (getF(a) != getF(b) ? getF(a) - getF(b) : a.h - b.h));

            //取开销最小的格子
            let min = openList.shift();
            closeList.push(min);

            //遍历周围可达的格子
            let reachableGrids = copyMap.arroundGrid(min.x, min.y);
            for (let grid of reachableGrids) {
                //该格子没走过时初始化，并加入到openList
                if (closeList.indexOf(grid) == -1 && openList.indexOf(grid) == -1) {
                    grid.resetContext(start, aim, min);
                    openList.push(grid);
                }

                //找到目的地了，记录路径并返回
                if (grid == aim) {
                    return grid.traceParent().reverse();
                }
            }
        }

        //无路可走了，选离终点最近的那条路
        closeList.sort((a, b) => a.h - b.h);
        let min = closeList.shift();
        return min.traceParent().reverse();

        function getF(grid) {
            return grid.g + grid.h;
        }
    }
}
