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

    /**
     * 返回修正之后的位置
     * 目的是解决移动前后tick的位置跨过了某障碍物的情况，修正后的位置是移动前位置和障碍物的交界处
     * @returns
     */
    fixDirectLocation() {
        //对当前格子做修正，如果当前位置已经是修正后的位置，返回undefined表示
        let fixNow = MapUtil.sceneToCanvas(MapUtil.canvasToScene(this.location()));
        if (fixNow.y == this.y && (this.direct == DIRECT_UP || this.direct == DIRECT_DOWN)) {
            return undefined;
        }
        if (fixNow.x == this.x && (this.direct == DIRECT_LEFT || this.direct == DIRECT_RIGHT)) {
            return undefined;
        }

        if (this.direct == DIRECT_UP) {
            return { x: this.x, y: fixNow.y };
        } else if (this.direct == DIRECT_LEFT) {
            return { x: fixNow.x, y: this.y };
        } else if (this.direct == DIRECT_DOWN) {
            return { x: this.x, y: fixNow.y + PIXEL_NUM };
        } else if (this.direct == DIRECT_RIGHT) {
            return { x: fixNow.x + PIXEL_NUM, y: this.y };
        }
    }

    location() {
        return { x: this.x, y: this.y };
    }

    locate(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Entity {
    constructor() {
        this.uuid = Util.uuid(); //生成uui
        this.tickContext = { collision: undefined, disappear: undefined }; //tick上下文：保存每个tick的状态
    }

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
     * 获取实体当前的碰撞箱
     */
    collision() {
        return [this.position.x, this.position.y, this.width, this.height];
    }

    /**
     * 实体tick
     */
    tick() {}

    /**
     * 绘制实体
     */
    draw(ctx) {}

    /**
     * 尝试移动，返回尝试移动后的碰撞箱[x,y,width,height]
     * @returns
     */
    tryMove() {}
    /**
     * 移动实体
     * @returns
     */
    move(x, y) {}
}

class Bullet extends Entity {
    constructor(parentEntity, x, y, direct, speed) {
        super();
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
     * 绘制子弹实体
     */
    draw(ctx) {
        ctx.fillStyle = '#0d0402';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    move(x, y) {
        this.position.locate(x, y);
    }
}

class Tank extends Entity {
    constructor(x, y, direct) {
        super();
        this.img = document.getElementById('tank');
        this.width = 4 * PIXEL_NUM; //坦克宽度：4个地图格子
        this.height = 4 * PIXEL_NUM; //坦克高度：4个地图格子
        this.position = new Position(x, y, direct);
        this.speed = 1.2; //坦克移动速度
        this.keyOpera = new KeyOpera(); //键盘事件栈
    }

    /**
     * 绘制坦克
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.position.direct.rotate);
        ctx.drawImage(this.img, this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
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
    move(x, y) {
        this.position.locate(x, y);
    }
    /**
     * 控制移动
     * @param {*} direct
     */
    moveControl(direct, moving) {
        if (direct != undefined) {
            this.position.direct = direct;
        }
        if (moving != undefined) {
            this.position.moving = moving;
        }
    }

    /**
     * 修正TickContext中的实体当前位置
     * 目的是解决移动前后tick的位置跨过了某障碍物的情况，修正后的位置是移动前位置和障碍物的交界处
     * @returns
     */
    fixDirectLocation() {
        let fix = this.position.fixDirectLocation();

        if (fix == undefined) {
            //不需要修正
            return false;
        } else {
            //需要修正
            this.tickContext.collision[0] = fix.x;
            this.tickContext.collision[1] = fix.y;
            return true;
        }
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
            this,
            bulletPosition[0],
            bulletPosition[1],
            this.position.direct,
            2.0
        );
        entityService.addEntity(bullet);
    }
}

class PlayerTank extends Tank {
    /**
     * 键盘按下监听
     * @param {*} event
     */
    keyDownListener(event) {
        if (this.keyOpera.isMoveKey(event.code)) {
            this.keyOpera.onKeyDown(event.code);

            let direct = this.keyOpera.locateDirect();
            this.moveControl(direct, true);
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
            this.moveControl(direct, !this.keyOpera.isEmpty());
        }
    }
}

class AiTank extends Tank {}
