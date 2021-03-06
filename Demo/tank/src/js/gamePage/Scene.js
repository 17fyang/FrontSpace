const NONE_COLLISION = [0, 0, 0, 0];
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
     *重置tick上下文对象
     */
    resettickStatus() {}

    /**
     *  绘制该元素
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {}

    /**
     *  碰撞箱
     */
    collision() {
        let canvas = MapUtil.sceneToCanvas({ x: this.x, y: this.y });
        return [canvas.x, canvas.y, this.width, this.height];
    }
}
/**
 * 空气
 */
class Air extends SceneItem {
    /**
     *  空气碰撞箱
     */
    collision() {
        return NONE_COLLISION;
    }

    /**
     *  绘制该元素
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        let canvas = MapUtil.sceneToCanvas({ x: this.x, y: this.y });
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
        let canvas = MapUtil.sceneToCanvas({ x: this.x, y: this.y });
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
    constructor(map, width, height) {
        this.width = width;
        this.height = height;

        //场景静态元素初始化
        sceneService.initMap(map);

        this.borderList = [
            [-1, 0, 1, this.height],
            [0, -1, this.width, 1],
            [this.width, 0, 1, this.height],
            [0, this.height, this.width, 1],
        ]; //边界碰撞箱
    }

    /**
     * 绘制场景
     */
    draw(ctx) {
        //绘制静态元素
        for (let wall of sceneService.sceneItemList) {
            wall.draw(ctx);
        }

        //绘制实体
        for (let entity of entityService.entityList) {
            entity.draw(ctx);
        }

        //TODO 临时代码，画出坦克的规划路线
        let ai = aiSercice.aiList[0];
        for (let road of ai.futureRoad) {
            ctx.fillStyle = '#00FF00';
            let canvasPoint = MapUtil.sceneToCanvas({ x: road.x, y: road.y });
            ctx.fillRect(canvasPoint.x, canvasPoint.y, PIXEL_NUM, PIXEL_NUM);
        }
    }

    /**
     * 场景tick
     */
    tick() {
        //重置tick上下文
        for (let entity of entityService.entityList) {
            entity.resettickStatus();
        }
        for (let item of sceneService.sceneItemList) {
            item.resettickStatus();
        }

        //计算实体碰撞情况
        for (let i = 0; i < entityService.entityList.length; i++) {
            let entity = entityService.entityList[i];

            //处理该实体tick
            entity.tick();

            if (entity instanceof AiTank) {
                entity.ai.tick();
            }

            //计算场景中实体和边界碰撞情况
            for (let border of this.borderList) {
                if (Util.collideCheck(border, entity.tickStatus.collision)) {
                    let event = new BorderCollideEvent(entity, border);
                    eventHandler.handle(event);
                }
            }

            //计算场景中的实体和静态元素碰撞情况
            for (let item of Util.copyArray(sceneService.sceneItemList)) {
                if (Util.collideCheck(entity.tickStatus.collision, item.collision())) {
                    let event = new ItemCollideEvent(entity, item);
                    eventHandler.handle(event);
                }
            }

            //计算场景中的实体和实体碰撞情况
            for (let otherEntity of entityService.entityList) {
                let tickCollision = entity.tickStatus.collision;
                let otherNowCollision = otherEntity.collision();
                if (entity != otherEntity && Util.collideCheck(tickCollision, otherNowCollision)) {
                    let event = new EntityCollideEvent(entity, otherEntity);
                    eventHandler.handle(event);
                }
            }

            //更新实体当前状态
            if (entity.tickStatus.disappear) {
                entityService.removeEntity(entity);
            }
            if (entity.tickStatus.allowMove) {
                entity.move(entity.tickStatus.collision[0], entity.tickStatus.collision[1]);
            }
        }
    }
}
