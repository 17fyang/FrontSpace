function main(canvas) {
    let ctx = canvas.getContext('2d');

    //获取选取的地图
    let map = JSON.parse(JSON.parse(localStorage.getItem('map')).map);

    //创建场景对象
    let scene = new Scene(map, canvas.width, canvas.height);
    //创建玩家坦克对象
    let tank = new PlayerTank(500, 250, DIRECT_UP);
    //创建AI坦克对象
    let aiTank = new AiTank(200, 100, DIRECT_UP);
    //创建AI坦克对象
    let aiTank2 = new AiTank(300, 100, DIRECT_UP);

    //给玩家坦克添加键盘和鼠标监听
    let body = document.getElementById('body');
    body.addEventListener('keydown', event => {
        soundService.playStart();
        tank.keyDownListener(event);
    });
    body.addEventListener('keyup', event => {
        tank.keyUpListener(event);
    });
    body.addEventListener('mousedown', event => {
        soundService.playStart();
        tank.shootBullet();
    });

    //实现帧动画
    window.requestAnimationFrame(function draw() {
        tickService.tick();

        //清空所有画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //场景tick
        scene.tick();

        //场景重绘
        scene.draw(ctx);

        //下一帧
        window.requestAnimationFrame(draw);
    });
}

function onload() {
    let canvas = document.getElementById('myCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    main(canvas);
}
