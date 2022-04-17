class KeyOpera {
    constructor() {
        this.directList = [DIRECT_UP, DIRECT_RIGHT, DIRECT_DOWN, DIRECT_LEFT];
        this.data = [];
    }

    valueOf(code) {
        for (let direct of this.directList) {
            if (direct.key == code) {
                return direct;
            }
        }
        return undefined;
    }

    isMoveKey(code) {
        return this.valueOf(code) != undefined;
    }

    isEmpty() {
        return this.data.length == 0 ? true : false;
    }

    /**
     * 取栈顶的key code
     * @returns
     */
    peek() {
        if (!this.isEmpty()) {
            return this.data[this.data.length - 1];
        }
    }

    /**
     * 键盘按下事件，如果和栈顶code不一致则压栈
     * @param {String} code
     */
    onKeyDown(code) {
        if (this.valueOf(code) != undefined && (this.isEmpty() || this.peek().key != code)) {
            this.data.push(this.valueOf(code));
        }
    }

    /**
     * 键盘抬起事件，找到栈中的code并删除
     * @param {String} code
     */
    onKeyUp(code) {
        let idx = this.data.indexOf(this.valueOf(code));
        if (idx >= 0) {
            this.data.splice(idx, 1);
        }
    }

    /**
     * 计算当前位置朝向（取栈顶code）
     * @returns 当前的位置朝向
     */
    locateDirect() {
        return this.peek();
    }
}
