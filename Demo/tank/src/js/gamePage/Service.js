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
        this.sceneItemMap = []; //场景静态元素Map索引
        this.sceneItemList = []; //场景静态元素List索引

        this.aiMap = undefined; //ai地图
    }

    /**
     * 初始化地图数据
     */
    initMap(map) {
        for (let i = 0; i < map.length; i++) {
            this.sceneItemMap[i] = [];
            for (let j = 0; j < map[i].length; j++) {
                this.sceneItemMap[i][j] = undefined;
                let item = SceneItem.valueOfByType(map[i][j], i, j);
                if (item == undefined || item instanceof Air) {
                    continue;
                }
                this.addSceneItem(item);
            }
        }

        //初始化AI地图
        this.aiMap = new AiMap(this.sceneItemMap);
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

        this.aiMap.remove(item.x, item.y);
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

class SoundServiceClass {
    constructor() {
        this.hasPlayStart = false;
    }

    playStart() {
        if (!this.hasPlayStart) {
            this.play('startGameSound');
            this.hasPlayStart = true;
        }
    }

    play(sound) {
        document.getElementById(sound).play();
    }
}

const soundService = new SoundServiceClass();
const entityService = new EntityServiceClass();
const sceneService = new SceneServiceClass();
const aiSercice = new AiServiceClass();
