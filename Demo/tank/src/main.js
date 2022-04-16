function main(canvas) {
    console.log('start my canvas');
    let ctx = canvas.getContext('2d');

    //创建场景对象
    let scene = new Scene(ctx, canvas.width, canvas.height);

    //创建玩家坦克对象
    let tank = new Tank(ctx, 500, 250, DIRECT_UP);
    //创建AI坦克对象
    let aiTank = new Tank(ctx, 100, 250, DIRECT_UP);

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
    scene.addEntity(tank);
    scene.addEntity(aiTank);

    //实现帧动画
    window.requestAnimationFrame(function draw() {
        //清空所有画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //重绘场景
        scene.tickCollide();
        scene.draw();
        window.requestAnimationFrame(draw);
    });
}

function onload() {
    let canvas = document.getElementById('myCanvas');
    main(canvas);
}
