const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext('2d');

const tempSlider = document.getElementById("temp-range");
const radiusSlider = document.getElementById("radius-range");
const massSlider = document.getElementById("mass-range");
const numSlider = document.getElementById("Num-particles");
const resetBtn = document.getElementById('resetBtn');

const MaxwellBoltzmannConstant = 1.380649e-23; 

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.onresize = resize;
resize();

let particles = [];

class Particle {
    constructor(x, y, vx, vy, r, mass) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.r = r; this.mass = mass;
        this.color = "#c414aaff";
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.r < 0) {
            this.vx *= -1;
            this.x = this.r;
        } else if (this.x + this.r > canvas.width) {
            this.vx *= -1;
            this.x = canvas.width - this.r;
        }

        if (this.y - this.r < 0) {
            this.vy *= -1;
            this.y = this.r;
        } else if (this.y + this.r > canvas.height) {
            this.vy *= -1;
            this.y = canvas.height - this.r;
        }
    }
}

function resolveCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = p1.r + p2.r;

    if (dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        
        const v1n = p1.vx * nx + p1.vy * ny;
        const v2n = p2.vx * nx + p2.vy * ny;

        if (v1n - v2n < 0) return;

        const p = 2 * (v1n - v2n) / (p1.mass + p2.mass);
        
        p1.vx -= p * p2.mass * nx;
        p1.vy -= p * p2.mass * ny;
        p2.vx += p * p1.mass * nx;
        p2.vy += p * p1.mass * ny;

        const overlap = minDist - dist;
        p1.x -= nx * (overlap / 2);
        p1.y -= ny * (overlap / 2);
        p2.x += nx * (overlap / 2);
        p2.y += ny * (overlap / 2);
    }
}

function initParticles() {
    particles = [];
    const temp = parseFloat(tempSlider.value);
    const radius = parseFloat(radiusSlider.value);
    const mass = parseFloat(massSlider.value);
    const num = parseInt(numSlider.value);

    for (let i = 0; i < num; i++) {
        const speed = Math.sqrt(temp / mass) * 0.5;
        const angle = Math.random() * 2 * Math.PI;
        particles.push(new Particle(
            Math.random() * (canvas.width - 2 * radius) + radius,
            Math.random() * (canvas.height - 2 * radius) + radius,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            radius,
            mass
        ));
    }
}

function update() {
    ctx.fillStyle = "#000"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const checkCollisions = particles.length < 600;

    for (let i = 0; i < particles.length; i++) {
        particles[i].move();
        if (checkCollisions) {
            for (let j = i + 1; j < particles.length; j++) {
                resolveCollision(particles[i], particles[j]);
            }
        }
        particles[i].draw();
    }

    document.getElementById("temp-display").innerText = tempSlider.value;
    document.getElementById("radius-display").innerText = radiusSlider.value;
    document.getElementById("mass-display").innerText = massSlider.value;
    document.getElementById("Num-particles-display").innerText = numSlider.value;

    requestAnimationFrame(update);
}

numSlider.onchange = initParticles;
radiusSlider.onchange = initParticles;
massSlider.onchange = initParticles;
tempSlider.onchange = initParticles;
resetBtn.onclick = initParticles;

initParticles();
update();