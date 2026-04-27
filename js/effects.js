// ========= 花瓣飘落动效 =========
const petalCanvas = document.getElementById('petalCanvas');
let pCtx = petalCanvas.getContext('2d');
let pWidth, pHeight;
let petals = [];
const PETAL_COUNT = 5;

function resizePetal() {
    pWidth = window.innerWidth;
    pHeight = window.innerHeight;
    petalCanvas.width = pWidth;
    petalCanvas.height = pHeight;
}
window.addEventListener('resize', resizePetal);
resizePetal();

class Petal {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * pWidth;
        this.y = Math.random() * -pHeight;
        this.size = 10 + Math.random() * 14;
        this.speedY = 1.0 + Math.random() * 1.6;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotateSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 0.4 + Math.random() * 0.3;
        this.type = Math.random() > 0.5 ? 'plum' : 'orchid';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotateSpeed;
        if (this.y > pHeight + 80 || this.x < -80 || this.x > pWidth + 80) this.reset();
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        if (this.type === 'plum') {
            ctx.moveTo(0, -this.size/2);
            ctx.quadraticCurveTo(this.size/3, -this.size/3, this.size/2, 0);
            ctx.quadraticCurveTo(this.size/3, this.size/3, 0, this.size/2);
            ctx.quadraticCurveTo(-this.size/3, this.size/3, -this.size/2, 0);
            ctx.quadraticCurveTo(-this.size/3, -this.size/3, 0, -this.size/2);
        } else {
            ctx.ellipse(0, 0, this.size/2.5, this.size, 0, 0, Math.PI*2);
        }
        ctx.fillStyle = `rgba(143, 176, 143, ${this.opacity * 0.8})`;
        ctx.fill();
        ctx.restore();
    }
}
function initPetals() { petals = []; for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal()); }
function animatePetals() {
    if (!pCtx) return;
    pCtx.clearRect(0, 0, pWidth, pHeight);
    for (let p of petals) { p.update(); p.draw(pCtx); }
    requestAnimationFrame(animatePetals);
}
initPetals();
animatePetals();

// ========= 银丝刺绣动效 =========
const stitchCanvas = document.getElementById('stitchCanvas');
let sCtx = stitchCanvas.getContext('2d');
let sWidth, sHeight;
let activeStitches = [];
function resizeStitch() {
    sWidth = window.innerWidth;
    sHeight = window.innerHeight;
    stitchCanvas.width = sWidth;
    stitchCanvas.height = sHeight;
}
window.addEventListener('resize', resizeStitch);
resizeStitch();
const CURVES = [
    { main: [[0,0], [22,-6], [45,-12], [68,-8], [90,0]], branches: [[[20,-5],[42,-10],[65,-6],[85,0]]] },
    { main: [[0,0], [18,4], [36,2], [54,-4], [72,0]], branches: [[[16,3],[32,1],[48,-3],[66,0]]] },
    { main: [[0,0], [25,6], [50,-1], [75,7], [100,5]], branches: [[[22,5],[45,0],[68,5],[92,4]]] }
];
class SilverStitch {
    constructor(x, y, idx) {
        this.startX = x; this.startY = y;
        this.pattern = CURVES[idx % CURVES.length];
        this.progress = 0; this.life = 1.0; this.speed = 0.028; this.glowDone = false;
    }
    update() {
        if (this.progress < 1) { this.progress += this.speed; if (this.progress >= 1) this.progress = 1; }
        else { this.life -= 0.018; }
        return this.life > 0;
    }
    draw(ctx) {
        if (this.progress <= 0) return;
        const points = this.pattern.main.map(p => ({x: this.startX + p[0], y: this.startY + p[1]}));
        const len = points.length;
        const drawTo = Math.floor(this.progress * (len-1));
        if (drawTo < 1) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i=1; i<=drawTo; i++) ctx.lineTo(points[i].x, points[i].y);
        const grad = ctx.createLinearGradient(this.startX, this.startY, points[drawTo].x, points[drawTo].y);
        grad.addColorStop(0, `rgba(240, 248, 255, ${this.life*0.98})`);
        grad.addColorStop(0.5, `rgba(214, 228, 240, ${this.life*0.9})`);
        grad.addColorStop(1, `rgba(176, 196, 222, ${this.life*0.8})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2 * (0.6 + this.progress*0.4) * this.life;
        ctx.stroke();
        if (this.progress > 0.4 && this.pattern.branches) {
            this.pattern.branches.forEach(branch => {
                const branchPoints = branch.map(p => ({x: this.startX + p[0], y: this.startY + p[1]}));
                const branchLen = branchPoints.length;
                const branchProgress = Math.max(0, (this.progress - 0.4) / 0.6);
                const branchDrawTo = Math.floor(branchProgress * (branchLen-1));
                if (branchDrawTo >= 1) {
                    ctx.beginPath();
                    ctx.moveTo(branchPoints[0].x, branchPoints[0].y);
                    for (let i=1; i<=branchDrawTo; i++) ctx.lineTo(branchPoints[i].x, branchPoints[i].y);
                    ctx.strokeStyle = `rgba(214, 228, 240, ${this.life*0.85})`;
                    ctx.lineWidth = 1.5 * (0.6 + branchProgress*0.4) * this.life;
                    ctx.stroke();
                }
            });
        }
        if (this.progress >= 0.96 && !this.glowDone && this.life > 0.8) {
            this.glowDone = true;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
            ctx.lineWidth = 3.2;
            ctx.stroke();
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(240,248,255,0.9)';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}
function addSilverStitch(x, y) {
    if (activeStitches.length > 10) return;
    const idx = Math.floor(Math.random() * CURVES.length);
    activeStitches.push(new SilverStitch(x, y, idx));
}
function animateSilverStitches() {
    if (!sCtx) return;
    sCtx.clearRect(0, 0, sWidth, sHeight);
    for (let i=activeStitches.length-1; i>=0; i--) {
        const s = activeStitches[i];
        const alive = s.update();
        s.draw(sCtx);
        if (!alive) activeStitches.splice(i,1);
    }
    requestAnimationFrame(animateSilverStitches);
}
animateSilverStitches();
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (!isMobile) {
    document.body.addEventListener('click', (e) => { addSilverStitch(e.clientX, e.clientY); });
}