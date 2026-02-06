const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.onresize = resize;
resize();

const coulumbConstant = 8.987551787e9; // these are the constants and converstions check my notes in the evidence file vro
const elementalCharge = 1.602e-19;
const protonMass = 1.6726219e-27;
const MEV_TO_JOULES = 1.602e-13;
const Pixels_to_meters = 1e-15; 
const DT = 2e-22; 

let particles = [];
let showTraces = true;
let nucleus = { x: canvas.width / 2, y: canvas.height / 2 };

class Alpha {
    constructor(yOffsetPx) {
        const energyMeV = parseFloat(document.getElementById('energySlider').value);
        const v0 = Math.sqrt((2 * energyMeV * MEV_TO_JOULES) / (4 * protonMass));
        this.mx = -(canvas.width / 2) * Pixels_to_meters;
        this.my = yOffsetPx * Pixels_to_meters;
        this.mvx = v0;
        this.mvy = 0;
        this.path = [];
        this.active = true;
        this.color = "#ff00c8ff"; 
    }

    update(Z) {
        let r2 = this.mx**2 + this.my**2;
        let r = Math.sqrt(r2);
        let force = (coulumbConstant * (2 * elementalCharge) * (Z * elementalCharge)) / r2;
        let acc = force / (4 * protonMass);

        this.mvx += (acc * (this.mx / r)) * DT;
        this.mvy += (acc * (this.my / r)) * DT;
        this.mx += this.mvx * DT;
        this.my += this.mvy * DT;

        if (showTraces) this.path.push({x: this.mx, y: this.my});
        const px = nucleus.x + (this.mx / Pixels_to_meters);
        if (px < -100 || px > canvas.width + 100) this.active = false;
    }

    draw() {
        if (showTraces && this.path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.moveTo(nucleus.x + (this.path[0].x / Pixels_to_meters), nucleus.y + (this.path[0].y / Pixels_to_meters));
            for(let p of this.path) ctx.lineTo(nucleus.x + (p.x/Pixels_to_meters), nucleus.y + (p.y/Pixels_to_meters));
            ctx.stroke();
        }
        const px = nucleus.x + (this.mx / Pixels_to_meters);
        const py = nucleus.y + (this.my / Pixels_to_meters);
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI*2);
        ctx.fill();
    }
}

function fireAlpha() {
    for(let i = 0; i < 8; i++) {
        setTimeout(() => {
            particles.push(new Alpha(Math.random() * 300 - 150));
        }, i * 80);
    }
}

function toggleTraces() {
    showTraces = !showTraces;
    document.getElementById('traceBtn').innerText = `Traces: ${showTraces ? 'ON' : 'OFF'}`;
}

function clearParticles() { particles = []; }

function animate() {
    nucleus = { x: canvas.width / 2, y: canvas.height / 2 };
    ctx.fillStyle = '#0d1117'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const Z = parseInt(document.getElementById('elementSelect').value);
    
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "gold";
    ctx.fillStyle = "rgb(232, 190, 0)";
    ctx.beginPath();
    ctx.arc(nucleus.x, nucleus.y, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    particles = particles.filter(p => p.active);
    particles.forEach(p => {
        p.update(Z);//67 in the big 25
        p.draw();
    });

    requestAnimationFrame(animate);
}

document.getElementById('energySlider').oninput = function() {
    document.getElementById('energyDisp').innerText = parseFloat(this.value).toFixed(1);
};

animate();

