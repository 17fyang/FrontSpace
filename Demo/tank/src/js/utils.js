class Util {
    /**
     * 2D矩形碰撞检测
     * @param {Array} collision1
     * @param {Array} collision2
     * @returns
     */
    static collisionCheck2D(collision1, collision2) {
        return (
            collision1[0] < collision2[0] + collision2[2] &&
            collision1[1] < collision2[1] + collision2[3] &&
            collision1[0] + collision1[2] > collision2[0] &&
            collision1[1] + collision1[3] > collision2[1]
        );
    }

    /**
     * 浅拷贝一份数组
     * @param {*} arr
     */
    static copyArray(arr) {
        let result = [];
        for (let item of arr) {
            result.push(item);
        }
        return result;
    }

    /**
     * 生成UUID
     * @returns
     */
    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

class MapUtil {
    static canvasToScene(canvas) {
        return { x: parseInt(canvas.x / PIXEL_NUM), y: parseInt(canvas.y / PIXEL_NUM) };
    }
    static sceneToCanvas(scene) {
        return { x: parseInt(scene.x * PIXEL_NUM), y: parseInt(scene.y * PIXEL_NUM) };
    }

    static canvasToAi(canvas) {
        let scene = MapUtil.canvasToScene(canvas);
        return MapUtil.sceneToAi(scene);
    }
    static sceneToAi(scene) {
        return { x: parseInt(scene.x / 4), y: parseInt(scene.y / 4) };
    }

    static canvasPoint(canvas, offsetX, offsetY) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: (offsetX * canvas.width) / bbox.width,
            y: (offsetY * canvas.height) / bbox.height,
        };
    }
}
