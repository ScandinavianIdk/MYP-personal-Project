const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext('2d');
const graphCanvas = document.getElementById("graphCanvas");
const gCtx = graphCanvas.getContext('2d');

const tempSlider = document.getElementById("temp-range");
const eaSlider = document.getElementById("ea-range");
const numSlider = document.getElementById("num-range");
const startBtn = document.getElementById("startBtn");
const catalystBtn = document.getElementById("catalystBtn");

let particles = [];
let graphHistory = [];
let time = 0;

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
}
window.onresize = resize;
resize();

class Particle {
    constructor(x, y, vx, vy, type) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.type = type;
        this.r = (type === 'C') ? 14 : 6; // Product C is much bigger
        this.dead = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        if (this.type === 'A') ctx.fillStyle = "#c414aa";      // Purple
        else if (this.type === 'B') ctx.fillStyle = "#14aac4"; // Blue
        else {
            ctx.fillStyle = "#ffee00"; // Big Yellow
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffee00";
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x - this.r < 0 || this.x + this.r > canvas.width) this.vx *= -1;
        if (this.y - this.r < 0 || this.y + this.r > canvas.height) this.vy *= -1;
    }
}

// LIVE TEMPERATURE SCALING
tempSlider.addEventListener('input', () => {
    const tempFactor = tempSlider.value / 300; // Relative to default 300K
    particles.forEach(p => {
        const speed = Math.sqrt(p.vx**2 + p.vy**2);
        if (speed > 0) {
            // Re-apply speed based on new temperature setting
            const directionX = p.vx / speed;
            const directionY = p.vy / speed;
            const newSpeed = tempFactor * 2.5; 
            p.vx = directionX * newSpeed;
            p.vy = directionY * newSpeed;
        }
    });
    document.getElementById("temp-display").innerText = tempSlider.value;
});

// CATALYST ACTION
catalystBtn.onclick = () => {
    let val = parseInt(eaSlider.value);
    eaSlider.value = Math.max(5, val - 30); // Drop activation energy
    document.getElementById("ea-display").innerText = eaSlider.value;
    
    catalystBtn.innerText = "Catalyst Active!";
    setTimeout(() => catalystBtn.innerText = "Add Catalyst", 1500);
};

function checkCollision(p1, p2) {
    if (p1.dead || p2.dead) return;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < p1.r + p2.r) {
        // Effective Collision check (A + B -> C)
        const relVX = p1.vx - p2.vx;
        const relVY = p1.vy - p2.vy;
        const collisionEnergy = 0.5 * (relVX*relVX + relVY*relVY);

        if (collisionEnergy > eaSlider.value && ((p1.type==='A' && p2.type==='B') || (p1.type==='B' && p2.type==='A'))) {
            p1.dead = true;
            p2.dead = true;
            // Spawn larger product ball
            particles.push(new Particle((p1.x+p2.x)/2, (p1.y+p2.y)/2, (p1.vx+p2.vx)/4, (p1.vy+p2.vy)/4, 'C'));
        } else {
            // Elastic Bounce
            p1.vx *= -1; p1.vy *= -1;
            p2.vx *= -1; p2.vy *= -1;
        }
    }
}

function drawGraph() {
    gCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    const maxParticles = parseInt(numSlider.value);
    
    // Reactant Trend Line
    gCtx.strokeStyle = "#c414aa";
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    graphHistory.forEach((data, i) => {
        const x = (i / 300) * graphCanvas.width;
        const y = graphCanvas.height - (data.r / maxParticles) * graphCanvas.height;
        if(i === 0) gCtx.moveTo(x, y); else gCtx.lineTo(x, y);
    });
    gCtx.stroke();

    // Product Trend Line
    gCtx.strokeStyle = "#ffee00";
    gCtx.beginPath();
    graphHistory.forEach((data, i) => {
        const x = (i / 300) * graphCanvas.width;
        const y = graphCanvas.height - (data.p / (maxParticles/2)) * graphCanvas.height;
        if(i === 0) gCtx.moveTo(x, y); else gCtx.lineTo(x, y);
    });
    gCtx.stroke();
}

function init() {
    particles = [];
    graphHistory = [];
    const count = parseInt(numSlider.value);
    const temp = tempSlider.value / 100;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width, 
            Math.random() * canvas.height, 
            (Math.random()-0.5) * temp * 4, 
            (Math.random()-0.5) * temp * 4, 
            i < count/2 ? 'A' : 'B'
        ));
    }
}

function loop() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => !p.dead);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        for (let j = i + 1; j < particles.length; j++) {
            checkCollision(particles[i], particles[j]);
        }
        particles[i].draw();
    }

    if (time % 10 === 0) {
        const rCount = particles.filter(p => p.type !== 'C').length;
        const pCount = particles.filter(p => p.type === 'C').length;
        graphHistory.push({r: rCount, p: pCount});
        if (graphHistory.length > 300) graphHistory.shift();
        drawGraph();
        
        document.getElementById("reactant-count").innerText = rCount;
        document.getElementById("product-count").innerText = pCount;
        document.getElementById("yield-display").innerText = Math.round((pCount / (numSlider.value/2)) * 100) + "%";
    }

    document.getElementById("ea-display").innerText = eaSlider.value;
    document.getElementById("num-display").innerText = numSlider.value;
    
    time++;
    requestAnimationFrame(loop);
}

startBtn.onclick = init;
init();
loop();