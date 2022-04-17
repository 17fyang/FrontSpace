class Event {
    apply() {}
}

/**
 * 实体间碰撞事件
 */
class EntityCollideEvent {
    constructor(entityContext1, entityContext2) {
        this.entityContext1 = entityContext1;
        this.entityContext2 = entityContext2;
    }
    apply() {
        if (this.entityContext1.entity instanceof Bullet) {
            if (this.entityContext2.entity instanceof Tank) {
                this.applyBulletTank(this.entityContext1, this.entityContext2);
            }
        }

        if (this.entityContext1.entity instanceof Tank) {
            if (this.entityContext2.entity instanceof Bullet) {
                this.applyBulletTank(this.entityContext2, this.entityContext1);
            } else if (this.entityContext2.entity instanceof Tank) {
                this.applyTankTank(this.entityContext1, this.entityContext2);
            }
        }
    }

    /**
     * 处理子弹和坦克的碰撞,子弹和坦克都消失
     * @param  bulletContext
     * @param  tnakContext
     */
    applyBulletTank(bulletContext, tankContext) {
        if (bulletContext.entity.parentEntity != tankContext.entity) {
            bulletContext.allowMove = false;
            bulletContext.entity.scene.removeEntity(bulletContext.entity);

            tankContext.allowMove = false;
            tankContext.entity.scene.removeEntity(tankContext.entity);
        }
    }

    /**
     *处理坦克和坦克的碰撞，两辆坦克都不能移动
     * @param  tankContext1
     * @param  tankContext2
     */
    applyTankTank(tankContext1, tankContext2) {
        tankContext1.allowMove = false;
        tankContext2.allowMove = false;
    }
}

/**
 * 实体和静态元素碰撞事件
 */
class ItemCollideEvent {
    constructor(entityContext, item) {
        this.context = entityContext;
        this.item = item;
    }
    apply() {
        //子弹撞到墙则消失
        if (this.context.entity instanceof Bullet) {
            if (this.item instanceof Wall || this.item instanceof AirWall) {
                this.context.allowMove = false;
                this.context.entity.scene.removeEntity(this.context.entity);
            }
        }

        //坦克撞到墙则不允许移动
        if (this.context.entity instanceof Tank) {
            if (this.item instanceof Wall || this.item instanceof AirWall) {
                this.context.allowMove = false;
            }
        }
    }
}

class EventHandler {
    /**
     * 处理一个事件
     * @param {Event} event
     */
    static handle(event) {
        event.apply();
    }
}
