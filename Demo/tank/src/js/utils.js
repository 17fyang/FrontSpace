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
}

class MapUtil {
    static canvasToMap([x, y]) {
        return { x: parseInt(x / PIXEL_NUM), y: parseInt(y / PIXEL_NUM) };
    }
    static mapToCanvas([x, y]) {
        return { x: parseInt(x * PIXEL_NUM), y: parseInt(y * PIXEL_NUM) };
    }

    static canvasPoint(canvas, offsetX, offsetY) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: (offsetX * canvas.width) / bbox.width,
            y: (offsetY * canvas.height) / bbox.height,
        };
    }
}
