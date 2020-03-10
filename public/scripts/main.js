const socket = io({transports: ['websocket'], upgrade: false});
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const drawBoundaries = () => {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 850, canvas.width, 5);
    ctx.fillRect(0, 575, 400, 5);
    ctx.fillRect(2000-400, 575, 400, 5);
    ctx.fillRect(550, 250, 900, 5)
}

drawBoundaries();