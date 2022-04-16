function onStart() {
    canvasMain();
}

function canvasMain() {
    var cvs = document.getElementById('mainCanvas');
    var ctx = cvs.getContext('2d');
    ctx.fillStyle = '#FFFFAA';
    ctx.fillRect(0, 0, 80, 100);
}
