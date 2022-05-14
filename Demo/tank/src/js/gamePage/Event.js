const ENTITY_COLLIDE_EVENT = 'entityCollideEvent';
const BORDER_COLLIDE_EVENT = 'BorderCollideEvent';
const ITEM_COLLIDE_EVENT = 'ItemCollideEvent';

class EntityEvent {
    constructor(entity) {
        this.entity = entity;
    }

    name() {
        return 'event';
    }
}

/**
 * 实体间碰撞事件
 */
class EntityCollideEvent extends EntityEvent {
    constructor(entity, otherEntity) {
        super(entity);
        this.otherEntity = otherEntity;
    }

    name() {
        return ENTITY_COLLIDE_EVENT;
    }
}
/**
 * 实体和边界碰撞事件
 */
class BorderCollideEvent extends EntityEvent {
    constructor(entity, border) {
        super(entity);
        this.border = border;
    }

    name() {
        return BORDER_COLLIDE_EVENT;
    }
}

/**
 * 实体和静态元素的碰撞事件
 */
class ItemCollideEvent extends EntityEvent {
    constructor(entity, item) {
        super(entity);
        this.item = item;
    }

    name() {
        return ITEM_COLLIDE_EVENT;
    }
}

class EventHandlerClass {
    constructor() {
        this.syncMap = new Map(); //{name:{uuid:handle}}
        this.asyncMap = new Map(); //{name:{uuid:handle}}
    }

    /**
     * 处理一个事件
     * @param {EntityEvent} event
     */
    handle(event) {
        this.handleSync(event);
        this.handleAsync(event);
    }

    /**
     * 同步处理一个事件
     * @param {EntityEvent} event
     */
    handleSync(event) {
        let eventHandler = this.syncMap.get(event.name());

        let entity = event.entity;
        if (entity && entity.uuid && eventHandler && eventHandler.has(entity.uuid)) {
            let handler = eventHandler.get(entity.uuid);
            handler(event);
        }
    }

    /**
     * 异步处理一个事件
     * @param {EntityEvent} event
     */
    handleAsync(event) {
        setTimeout(() => {
            let eventHandler = this.asyncMap.get(event.name());
            let entity = event.entity;
            if (entity && entity.uuid && eventHandler && eventHandler.has(entity.uuid)) {
                let handler = eventHandler.get(entity.uuid);
                handler(event);
            }
        }, 0);
    }

    /**
     * 注册一个同步事件监听
     * @param {String} name
     * @param {String} uuid
     * @param {Function} handler
     */
    registeSync(name, uuid, handler) {
        let eventMap = this.syncMap.get(name);

        if (eventMap == undefined) {
            eventMap = new Map();
        }

        eventMap.set(uuid, handler);
        this.syncMap.set(name, eventMap);
    }

    /**
     * 注册一个异步事件监听
     * @param {String} name
     * @param {String} uuid
     * @param {Function} handler
     */
    registeAsync(name, uuid, handler) {
        let eventMap = this.asyncMap.get(name);

        if (eventMap == undefined) {
            eventMap = new Map();
        }

        eventMap.set(uuid, handler);
        this.asyncMap.set(name, eventMap);
    }

    /**
     * 移除一个uuid所有的监听
     * @param {String} uuid
     */
    removeAllListener(uuid) {
        for (let value of this.syncMap.values()) {
            if (value.has(uuid)) {
                value.delete(uuid);
            }
        }
        for (let value of this.asyncMap.values()) {
            if (value.has(uuid)) {
                value.delete(uuid);
            }
        }
    }
}
const eventHandler = new EventHandlerClass();
