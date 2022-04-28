const DIRECT_UP = { key: 'KeyW', rotate: 0 };
const DIRECT_RIGHT = { key: 'KeyD', rotate: Math.PI / 2 };
const DIRECT_DOWN = { key: 'KeyS', rotate: Math.PI };
const DIRECT_LEFT = { key: 'KeyA', rotate: (Math.PI * 3) / 2 };

class Position {
    constructor(x, y, direct) {
        this.x = x;
        this.y = y;
        this.direct = direct;
        this.moving = false;
    }

    /**
     * 尝试移动，返回尝试移动后的位置
     * @param {float} spped
     * @returns
     */
    tryMove(spped) {
        //如果不在移动状态，则位置不变
        if (!this.moving) {
            return [this.x, this.y];
        }

        if (this.direct == DIRECT_UP) {
            return [this.x, this.y - 2 * spped];
        } else if (this.direct == DIRECT_DOWN) {
            return [this.x, this.y + 2 * spped];
        } else if (this.direct == DIRECT_LEFT) {
            return [this.x - 2 * spped, this.y];
        } else if (this.direct == DIRECT_RIGHT) {
            return [this.x + 2 * spped, this.y];
        } else {
            return [this.x, this.y];
        }
    }

    locate(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Entity {
    constructor(ctx) {
        this.ctx = ctx;
        this.scene = undefined;
        this.tickContext = { collision: undefined, disappear: undefined }; //tick上下文：保存每个tick的状态
    }

    /**
     * 实体碰撞事件
     */
    collideEvent(item) {}

    /**
     *重置tick上下文对象
     */
    resetTickContext() {
        this.tickContext = {
            collision: this.tryMove(),
            allowMove: true,
            disappear: false,
        };
    }

    /**
     * 绘制实体
     */
    draw() {}

    /**
     * 尝试移动，返回尝试移动后的碰撞箱[x,y,width,height]
     * @returns
     */
    tryMove() {}
    /**
     * 移动实体
     * @returns
     */
    move() {}

    /**
     * 获取实体当前的碰撞箱
     */
    collision() {
        return [this.position.x, this.position.y, this.width, this.height];
    }

    /**
     * 设置实体所在的场景
     * @param {Scene} scene
     */
    setScene(scene) {
        this.scene = scene;
    }
}

class Bullet extends Entity {
    constructor(ctx, parentEntity, x, y, direct, speed) {
        super(ctx);
        this.parentEntity = parentEntity; //发射子弹的实体
        this.width = 10; //子弹碰撞盒宽度
        this.height = 10; //子弹碰撞盒高度

        let realX = direct == DIRECT_UP || direct == DIRECT_DOWN ? x - this.width / 2 : x;
        let realY = direct == DIRECT_LEFT || direct == DIRECT_RIGHT ? y - this.height / 2 : y;
        this.position = new Position(realX, realY, direct);
        this.position.moving = true;
        this.speed = speed; //子弹速度
    }

    /**
     * 实体碰撞事件
     */
    collideEvent(item) {
        //子弹如果撞到了墙则消失
        if (item instanceof Brick || item instanceof AirWall) {
            this.scene.removeEntity(this);
        }
        //子弹如果撞到了坦克则坦克和子弹都消失
        if (item instanceof Tank && item != this.parentEntity) {
            this.scene.removeEntity(item);
            this.scene.removeEntity(this);
        }
    }

    /**
     * 绘制子弹实体
     */
    draw() {
        this.ctx.fillStyle = '#0d0402';
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    /**
     * 尝试移动，返回尝试移动后的碰撞箱[x,y,width,height]
     * @returns
     */
    tryMove() {
        let location = this.position.tryMove(this.speed);
        return [location[0], location[1], this.width, this.height];
    }

    /**
     * 移动实体
     * @returns
     */
    move() {
        let location = this.position.tryMove(this.speed);
        this.position.locate(location[0], location[1]);
    }
}

class Tank extends Entity {
    constructor(ctx, x, y, direct) {
        super(ctx);
        this.img = document.getElementById('tank');
        this.width = 4 * PIXEL_NUM; //坦克宽度：4个地图格子
        this.height = 4 * PIXEL_NUM; //坦克高度：4个地图格子
        this.position = new Position(x, y, direct);
        this.speed = 1.0; //坦克移动速度
        this.keyOpera = new KeyOpera(); //键盘事件栈
    }

    /**
     * 绘制坦克
     */
    draw() {
        this.ctx.save();
        this.ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        this.ctx.rotate(this.position.direct.rotate);
        this.ctx.drawImage(this.img, this.width / -2, this.height / -2, this.width, this.height);
        this.ctx.restore();
    }

    /**
     * 实体碰撞事件
     */
    collideEvent(item) {
        //子弹如果撞到了坦克则坦克和子弹都消失
        if (item instanceof Tank) {
            this.scene.removeEntity(item);
            this.scene.removeEntity(this);
        }
    }

    /**
     * 尝试移动，返回尝试移动后的碰撞箱[x,y,width,height]
     * @returns
     */
    tryMove() {
        let location = this.position.tryMove(this.speed);
        return [location[0], location[1], this.width, this.height];
    }
    /**
     * 移动
     * @returns
     */
    move() {
        let location = this.position.tryMove(this.speed);
        this.position.locate(location[0], location[1]);
    }

    /**
     * 发射子弹
     */
    shootBullet() {
        if (this.position.direct == DIRECT_UP) {
            var bulletPosition = [this.position.x + this.width / 2, this.position.y];
        } else if (this.position.direct == DIRECT_RIGHT) {
            var bulletPosition = [this.position.x + this.width, this.position.y + this.height / 2];
        } else if (this.position.direct == DIRECT_DOWN) {
            var bulletPosition = [this.position.x + this.width / 2, this.position.y + this.height];
        } else if (this.position.direct == DIRECT_LEFT) {
            var bulletPosition = [this.position.x, this.position.y + this.height / 2];
        }

        let bullet = new Bullet(
            this.ctx,
            this,
            bulletPosition[0],
            bulletPosition[1],
            this.position.direct,
            2.0
        );
        this.scene.addEntity(bullet);
    }

    /**
     * 键盘按下监听
     * @param {*} event
     */
    keyDownListener(event) {
        if (this.keyOpera.isMoveKey(event.code)) {
            this.keyOpera.onKeyDown(event.code);

            let direct = this.keyOpera.locateDirect();
            if (direct != undefined) {
                this.position.direct = direct;
            }

            if (!this.keyOpera.isEmpty()) {
                this.position.moving = true;
            }
        }
    }

    /**
     * 键盘抬起监听
     * @param {*} event
     */
    keyUpListener(event) {
        if (this.keyOpera.isMoveKey(event.code)) {
            this.keyOpera.onKeyUp(event.code);

            let direct = this.keyOpera.locateDirect();
            if (direct != undefined) {
                this.position.direct = direct;
            }

            if (this.keyOpera.isEmpty()) {
                this.position.moving = false;
            }
        }
    }
}
