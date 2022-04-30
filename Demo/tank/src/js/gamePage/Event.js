class Event {
    apply() {}
}

/**
 * 实体间碰撞事件
 */
class EntityCollideEvent extends Event {
    constructor(entity1, entity2) {
        super();
        this.entity1 = entity1;
        this.entity2 = entity2;
    }
    apply() {
        if (this.entity1 instanceof Bullet) {
            if (this.entity2 instanceof Tank) {
                this.applyBulletTank(this.entity1, this.entity2);
            }
        }

        if (this.entity1 instanceof Tank) {
            if (this.entity2 instanceof Bullet) {
                this.applyBulletTank(this.entity2, this.entity1);
            } else if (this.entity2 instanceof Tank) {
                this.applyTankTank(this.entity1, this.entity2);
            }
        }
    }

    /**
     * 处理子弹和坦克的碰撞,子弹和坦克都消失
     * @param  bullet
     * @param  tnakContext
     */
    applyBulletTank(bullet, tank) {
        if (bullet.parentEntity != tank) {
            bullet.tickContext.allowMove = false;
            bullet.tickContext.disappear = true;

            tank.tickContext.allowMove = false;
            tank.tickContext.disappear = true;
        }
    }

    /**
     *处理坦克和坦克的碰撞，两辆坦克都不能移动
     * @param  tank1
     * @param  tank2
     */
    applyTankTank(tank1, tank2) {
        tank1.tickContext.allowMove = false;
        tank2.tickContext.allowMove = false;
    }
}
/**
 * 实体和边界碰撞事件
 */
class BorderCollideEvent extends Event {
    constructor(entity, border) {
        super();
        this.entity = entity;
        this.border = border;
    }
    apply() {
        if (this.entity instanceof Bullet) {
            //子弹撞到了边界，子弹消失
            this.entity.tickContext.disappear = true;
        } else if (this.entity instanceof Tank) {
            //坦克撞到边界，需要修正下一tick坦克的位置
            this.entity.fixTickContextLocation();
        }
    }
}

/**
 * 实体和静态元素的碰撞事件
 */
class ItemCollideEvent extends Event {
    constructor(entity, item) {
        super();
        this.entity = entity;
        this.scene = entity.scene;
        this.item = item;
    }
    apply() {
        //子弹撞到墙则消失
        if (this.entity instanceof Bullet) {
            if (this.item instanceof Brick) {
                //子弹撞到了砖块，子弹和砖块都消失
                this.entity.tickContext.allowMove = false;
                this.entity.tickContext.disappear = true;
                let bulletDirect = this.entity.position.direct;
                for (let affectItem of this.relocateItem(this.item.x, this.item.y, bulletDirect)) {
                    affectItem.tickContext.disappear = true;
                }
            }
        }

        //坦克撞到墙，需要修正下一tick坦克的位置
        if (this.entity instanceof Tank) {
            if (this.item instanceof Brick) {
                this.entity.fixTickContextLocation();
            }
        }
    }

    /**
     * 子弹碰撞到墙时，会辐射周围的墙，入参是子弹和墙的碰撞地图坐标，出参是辐射到的实体对象
     * @param {Number} x
     * @param {Number} y
     * @param {} direct
     */
    relocateItem(x, y, direct) {
        let candidate = [];
        if (direct == DIRECT_LEFT || direct == DIRECT_RIGHT) {
            candidate.push(sceneService.getSceneItem(x, parseInt(y / 2) * 2));
            candidate.push(sceneService.getSceneItem(x, parseInt(y / 2) * 2 + 1));
        } else if (direct == DIRECT_UP || direct == DIRECT_DOWN) {
            candidate.push(sceneService.getSceneItem(parseInt(x / 2) * 2, y));
            candidate.push(sceneService.getSceneItem(parseInt(x / 2) * 2 + 1, y));
        }

        let itemList = [];
        for (let item of candidate) {
            if (item) {
                itemList.push(item);
            }
        }
        return itemList;
    }
}

class EventHandlerClass {
    constructor() {
        this.itemCollideEventListener = [];
        this.borderCollideEventListener = [];
    }

    /**
     * 处理一个事件
     * @param {Event} event
     */
    handle(event) {
        event.apply();
        if (event instanceof ItemCollideEvent) {
            console.log(event);
        }
        this.handleAsync(event);
    }

    /**
     * 异步处理一个事件
     * @param {Event} event
     */
    handleAsync(event) {
        setTimeout(() => {
            if (event instanceof ItemCollideEvent) {
                let asyncListener = this.itemCollideEventListener[event.entity.uuid];
                if (asyncListener != undefined) {
                    asyncListener(event);
                }
            } else if (event instanceof BorderCollideEvent) {
                let asyncListener = this.borderCollideEventListener[event.entity.uuid];
                if (asyncListener != undefined) {
                    asyncListener(event);
                }
            }
        }, 0);
    }

    removeAllListener(entity) {
        this.itemCollideEventListener[entity.uuid] = undefined;
        this.borderCollideEventListener[entity.uuid] = undefined;
    }

    addItemCollideEventListener(entity, handler) {
        this.itemCollideEventListener[entity.uuid] = handler;
    }

    addBorderCollideEventListener(entity, handler) {
        this.borderCollideEventListener[entity.uuid] = handler;
    }
}
const eventHandler = new EventHandlerClass();
