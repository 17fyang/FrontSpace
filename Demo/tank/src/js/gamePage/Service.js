class EntityServiceClass {
    constructor() {
        this.entityList = []; //所有实体
    }

    getByUuid(uuid) {
        for (let entity of this.entityList) {
            if (entity.uuid == uuid) {
                return entity;
            }
        }
    }

    addEntity(entity) {
        this.entityList.push(entity);
    }

    removeEntity(entity) {
        let idx = this.entityList.indexOf(entity);
        if (idx >= 0) {
            this.entityList.splice(idx, 1);
        }
    }
}

class SceneServiceClass {
    constructor() {
        this.sceneItemMap = this.initMap(); //场景静态元素Map索引
        this.sceneItemList = []; //场景静态元素List索引
    }

    /**
     * 初始化空的地图数据
     */
    initMap() {
        let map = [];
        for (let i = 0; i < MAP_WIDTH; i++) {
            map[i] = [];
            for (let j = 0; j < MAP_HEIGHT; j++) {
                map[i][j] = undefined;
            }
        }
        return map;
    }

    /**
     *给场景添加静态元素
     * @param {SceneItem} item
     */
    addSceneItem(item) {
        this.sceneItemMap[item.x][item.y] = item;
        this.sceneItemList.push(item);
    }

    /**
     *  移除场景中的静态元素
     * @param {SceneItem} item
     */
    removeSceneItem(item) {
        this.sceneItemMap[item.x][item.y] = undefined;

        let idx = this.sceneItemList.indexOf(item);
        if (idx >= 0) {
            this.sceneItemList.splice(idx, 1);
        }
    }

    /**
     * 查找场景中的静态元素
     * @param {Number} x
     * @param {Number} y
     * @returns
     */
    getSceneItem(x, y) {
        return this.sceneItemMap[x][y];
    }
}

class AiServiceClass {
    constructor() {
        this.aiList = []; //所有坦克AI
    }

    /**
     * 添加ai
     * @param {TankAi} tankAi
     */
    addAi(tankAi) {
        this.aiList.push(tankAi);
    }
}

const entityService = new EntityServiceClass();
const sceneService = new SceneServiceClass();
const aiSercice = new AiServiceClass();
