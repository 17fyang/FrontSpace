function main(canvas) {
    console.log('start my canvas');
    let ctx = canvas.getContext('2d');

    //创建场景对象
    let scene = new Scene(canvas.width, canvas.height);

    //创建玩家坦克对象
    let tank = new PlayerTank(500, 250, DIRECT_UP);

    //创建ai地图对象
    let aiMap = new AiMap(sceneService.sceneItemMap);
    //创建AI坦克对象
    let aiTank = new AiTank(200, 250, DIRECT_UP);
    //创建坦克AI行为对象
    let tankAi = new TankAi(aiMap, aiTank);

    //给玩家坦克添加键盘和鼠标监听
    let body = document.getElementById('body');
    body.addEventListener('keydown', event => {
        tank.keyDownListener(event);
    });
    body.addEventListener('keyup', event => {
        tank.keyUpListener(event);
    });
    body.addEventListener('mousedown', event => {
        tank.shootBullet();
    });

    //把坦克添加到场景中
    entityService.addEntity(tank);
    entityService.addEntity(aiTank);

    //实现帧动画
    window.requestAnimationFrame(function draw() {
        //清空所有画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //ai tick
        tankAi.tick();

        //重绘场景
        scene.tickCollide();
        scene.draw(ctx);
        window.requestAnimationFrame(draw);
    });
}

function onload() {
    let canvas = document.getElementById('myCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    main(canvas);
}
