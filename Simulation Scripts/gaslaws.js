const canvas = document.getElementById("simulationCanvas");
const graphCanvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext('2d');
const gCtx = graphCanvas.getContext('2d');

// UI Selectors
const tempS = document.getElementById("temp-range");
const volS = document.getElementById("volume-range");
const numS = document.getElementById("num-range");
const massS = document.getElementById("mass-range");

let particles = [];
let momentumTotal = 0;
let graphData = [];

function setup() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = 100;
}

class Particle {
    constructor(x, y, vx, vy, mass) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.mass = mass; this.r = 4;
    }
    move() {
        this.x += this.vx; this.y += this.vy;
        const limitX = parseInt(volS.value);
        if (this.x < 0 || this.x > limitX) { this.vx *= -1; momentumTotal += Math.abs(this.vx * 2); }
        if (this.y < 0 || this.y > canvas.height) { this.vy *= -1; momentumTotal += Math.abs(this.vy * 2); }
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = "white"; ctx.fill();
    }
}

function init() {
    setup();
    particles = [];
    const speed = Math.sqrt(tempS.value / massS.value) * 0.5;
    for(let i=0; i<numS.value; i++) {
        const angle = Math.random() * Math.PI*2;
        particles.push(new Particle(Math.random()*volS.value, Math.random()*canvas.height, Math.cos(angle)*speed, Math.sin(angle)*speed, massS.value));
    }
}

setInterval(() => {
    const p = (momentumTotal / 500) / (volS.value * canvas.height / 100000);
    document.getElementById("pressure-display").innerText = p.toFixed(2);
    graphData.push(p);
    if(graphData.length > 100) graphData.shift();
    momentumTotal = 0;
}, 500);

function animate() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    ctx.strokeStyle = "#56874a";
    ctx.strokeRect(0, 0, volS.value, canvas.height);
    
    particles.forEach(p => { p.move(); p.draw(); });
    
    //  fancy graph
    gCtx.clearRect(0,0,graphCanvas.width, graphCanvas.height);
    gCtx.strokeStyle = "#56874a";
    gCtx.beginPath();
    graphData.forEach((d, i) => {
        gCtx.lineTo(i * (graphCanvas.width/100), 100 - (d * 5));
    });
    gCtx.stroke();
    
    document.getElementById("temp-display").innerText = tempS.value;
    document.getElementById("volume-display").innerText = volS.value;
    document.getElementById("num-display").innerText = numS.value;
    document.getElementById("mass-display").innerText = massS.value;
    
    requestAnimationFrame(animate);
}

[tempS, volS, numS, massS].forEach(s => s.oninput = init);
init(); animate();