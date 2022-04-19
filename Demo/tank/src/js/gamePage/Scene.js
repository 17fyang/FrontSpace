class SceneItem {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width == undefined ? PIXEL_NUM : width; //一个元素单位的宽默认是一个地图格子
        this.height = height == undefined ? PIXEL_NUM : height; //一个元素单位的高默认是一个地图格子
    }

    static valueOfByType(type, x, y, width, height) {
        if (type == ITEM_NONE) {
            return new Air(x, y);
        } else if (type == ITEM_BRICK) {
            return new Brick(x, y);
        }
    }

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
 * 空气墙
 */
class AirWall extends SceneItem {
    /**
     *  空气墙碰撞箱
     * @param {Aryay} collision
     */
    collision(collision) {
        return [this.x, this.y, this.width, this.height];
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
}

class Scene {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.sceneItemList = []; //场景静态元素
        this.entityList = []; //所有实体

        //场景静态元素初始化
        this.init();
    }

    /**
     * 场景初始化
     */
    init() {
        //初始化场景的边框：用四个空气墙围起来
        this.sceneItemList.push(new AirWall(-1, 0, 1, this.height));
        this.sceneItemList.push(new AirWall(0, -1, this.width, 1));
        this.sceneItemList.push(new AirWall(this.width, 0, 1, this.height));
        this.sceneItemList.push(new AirWall(0, this.height, this.width, 1));

        for (let i = 0; i < 10; i++) {
            let wall = new Brick(10, 10 + i);
            this.sceneItemList.push(wall);
            let wall2 = new Brick(11, 10 + i);
            this.sceneItemList.push(wall2);
        }
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
        //实体下一Tick的状态
        let tickContextList = [];
        for (let entity of this.entityList) {
            tickContextList.push({
                entity: entity,
                collision: entity.tryMove(),
                allowMove: true,
            });
        }

        //计算实体碰撞情况
        for (let i = 0; i < tickContextList.length; i++) {
            let context = tickContextList[i];

            //计算场景中的实体和静态元素碰撞情况
            for (let item of this.sceneItemList) {
                if (Util.collisionCheck2D(context.collision, item.collision())) {
                    let event = new ItemCollideEvent(context, item);
                    EventHandler.handle(event);
                }
            }

            //计算场景中的实体和实体碰撞情况
            for (let j = i + 1; j < tickContextList.length; j++) {
                let contextJ = tickContextList[j];
                if (Util.collisionCheck2D(context.collision, contextJ.collision)) {
                    let event = new EntityCollideEvent(context, contextJ);
                    EventHandler.handle(event);
                }
            }
        }

        //处理实体状态生效
        for (let context of tickContextList) {
            if (context.allowMove) {
                context.entity.move();
            }
        }
    }

    /**
     * 场景静态元素碰撞检测
     * @param {Array} collision
     * @returns
     */
    collisionCheck(collision) {
        for (let item of this.sceneItemList) {
            if (item.collisionCheck(collision)) {
                return item;
            }
        }
        return undefined;
    }
}
