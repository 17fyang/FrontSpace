class SceneItem {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width == undefined ? PIXEL_NUM : width; //一个元素单位的宽默认是一个地图格子
        this.height = height == undefined ? PIXEL_NUM : height; //一个元素单位的高默认是一个地图格子
        this.tickContext = { collision: undefined, disappear: undefined }; //tick上下文：保存每个tick的状态
    }

    static valueOfByType(type, x, y, width, height) {
        if (type == ITEM_NONE) {
            return new Air(x, y);
        } else if (type == ITEM_BRICK) {
            return new Brick(x, y);
        }
    }

    /**
     *重置tick上下文对象
     */
    resetTickContext() {}

    /**
     *  绘制该元素
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {}

    /**
     *  碰撞箱
     * @param {Aryay} collision
     */
    collision(collision) {
        let canvas = MapUtil.mapToCanvas([this.x, this.y]);
        return [canvas.x, canvas.y, this.width, this.height];
    }
}
/**
 * 空气
 */
class Air extends SceneItem {
    /**
     *  空气碰撞箱
     * @param {Aryay} collision
     */
    collision(collision) {
        return [0, 0, 0, 0];
    }

    /**
     *  绘制该元素
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        let canvas = MapUtil.mapToCanvas([this.x, this.y]);
        ctx.clearRect(canvas.x, canvas.y, this.width, this.height);
    }
}

/**
 * 实物墙
 */
class Brick extends SceneItem {
    static BRICK_GREY = '#BEBEBE';
    static BRICK_SHADOW = '#2F4F4F';
    static BRICK_YELLOW = '#CD6839';
    /**
     *  绘制墙体
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        let border = parseInt(PIXEL_NUM / 5);
        let canvas = MapUtil.mapToCanvas([this.x, this.y]);
        if (this.x % 2 == this.y % 2) {
            //左上角和右下角砖块形状
            ctx.fillStyle = Brick.BRICK_SHADOW;
            ctx.fillRect(canvas.x, canvas.y, this.width, border);
            ctx.fillStyle = Brick.BRICK_YELLOW;
            ctx.fillRect(canvas.x, canvas.y + border, this.width, this.height - 2 * border);
            ctx.fillStyle = Brick.BRICK_GREY;
            ctx.fillRect(canvas.x, canvas.y + this.height - border, this.width, border);
        } else {
            //右上角和左下角砖块形状
            ctx.fillStyle = Brick.BRICK_GREY;
            ctx.fillRect(canvas.x, canvas.y, this.width, this.height);
            ctx.fillStyle = Brick.BRICK_SHADOW;
            ctx.fillRect(canvas.x + border, canvas.y, this.width - border, this.height - border);
            ctx.fillStyle = Brick.BRICK_YELLOW;
            ctx.fillRect(
                canvas.x + 2 * border,
                canvas.y + border,
                this.width - 2 * border,
                this.height - 2 * border
            );
        }
    }

    /**
     *重置tick上下文对象
     */
    resetTickContext() {
        this.tickContext = { collision: this.collision(), disappear: false };
    }
}

class Scene {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.sceneItemMap = this.initMap(); //场景静态元素Map索引
        this.sceneItemList = []; //场景静态元素List索引
        this.entityList = []; //所有实体

        this.borderList = [
            [-1, 0, 1, this.height],
            [0, -1, this.width, 1],
            [this.width, 0, 1, this.height],
            [0, this.height, this.width, 1],
        ]; //边界碰撞箱

        //场景静态元素初始化
        this.init();
    }

    /**
     * 场景初始化
     */
    init() {
        for (let i = 0; i < 10; i++) {
            this.addSceneItem(new Brick(10, 10 + i));
            this.addSceneItem(new Brick(11, 10 + i));
            this.addSceneItem(new Brick(12, 10 + i));
            this.addSceneItem(new Brick(13, 10 + i));
        }
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
     * 给场景添加实体
     * @param {Entity} entity
     */
    addEntity(entity) {
        entity.setScene(this);
        this.entityList.push(entity);
    }

    /**
     * 从场景中移除实体
     * @param {Entity} entity
     */
    removeEntity(entity) {
        let idx = this.entityList.indexOf(entity);
        if (idx >= 0) {
            this.entityList.splice(idx, 1);
        }
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

    /**
     * 绘制场景
     */
    draw() {
        //绘制静态元素
        for (let wall of this.sceneItemList) {
            wall.draw(this.ctx);
        }

        //绘制实体
        for (let entity of this.entityList) {
            entity.draw();
        }
    }

    /**
     * 计算场景碰撞并tick
     */
    tickCollide() {
        //重置tick上下文
        for (let entity of this.entityList) {
            entity.resetTickContext();
        }
        for (let item of this.sceneItemList) {
            item.resetTickContext();
        }

        //计算实体碰撞情况
        for (let i = 0; i < this.entityList.length; i++) {
            let entity = this.entityList[i];

            //计算场景中实体和边界碰撞情况
            for (let border of this.borderList) {
                if (Util.collisionCheck2D(border, entity.tickContext.collision)) {
                    let event = new BorderCollideEvent(entity, border);
                    EventHandler.handle(event);
                }
            }

            //计算场景中的实体和静态元素碰撞情况
            for (let item of this.sceneItemList) {
                if (checkContextCollision(entity, item)) {
                    let event = new ItemCollideEvent(entity, item);
                    EventHandler.handle(event);
                }
            }

            //计算场景中的实体和实体碰撞情况
            for (let j = i + 1; j < this.entityList.length; j++) {
                let otherEntity = this.entityList[j];
                if (checkContextCollision(entity, otherEntity)) {
                    let event = new EntityCollideEvent(entity, otherEntity);
                    EventHandler.handle(event);
                }
            }
        }

        //处理实体状态生效
        for (let entity of Util.copyArray(this.entityList)) {
            if (entity.tickContext.disappear) {
                this.removeEntity(entity);
            }
            if (entity.tickContext.allowMove) {
                entity.move();
            }
        }
        //处理静态元素状态生效
        for (let item of Util.copyArray(this.sceneItemList)) {
            if (item.tickContext.disappear) {
                this.removeSceneItem(item);
            }
        }

        /**
         * 校验两个obj对应的TickContext是否发生了碰撞
         * @param {*} obj1
         * @param {*} obj2
         * @returns
         */
        function checkContextCollision(obj1, obj2) {
            return Util.collisionCheck2D(obj1.tickContext.collision, obj2.tickContext.collision);
        }
    }
}
