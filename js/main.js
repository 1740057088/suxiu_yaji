document.addEventListener("DOMContentLoaded", function () {
    // ========= 花瓣飘落动效 =========
    const petalCanvas = document.getElementById('petalCanvas');
    let pCtx = petalCanvas ? petalCanvas.getContext('2d') : null;
    let pWidth, pHeight;
    let petals = [];
    const PETAL_COUNT = 5;

    function resizePetal() {
        if (!petalCanvas) return;
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
    function initPetals() {
        if (!pCtx) return;
        petals = [];
        for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());
    }
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
    let sCtx = stitchCanvas ? stitchCanvas.getContext('2d') : null;
    let sWidth, sHeight;
    let activeStitches = [];
    function resizeStitch() {
        if (!stitchCanvas) return;
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
        if (!sCtx || activeStitches.length > 10) return;
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

    // ========= 用户数据管理 =========
    let currentUser = null;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    function saveUsers() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function validateUser(account, password) {
        const user = users.find(u => u.username === account || u.email === account);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    function registerUser(username, email, password) {
        if (users.some(u => u.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        if (users.some(u => u.email === email)) {
            return { success: false, message: '邮箱已被注册' };
        }
        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers();
        return { success: true, user: newUser };
    }

    function updateUserStatus(user) {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (user && userInfo && userName && loginBtn && registerBtn && logoutBtn) {
            userInfo.style.display = 'inline-block';
            userName.textContent = user.username;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else if (userInfo && loginBtn && registerBtn && logoutBtn) {
            userInfo.style.display = 'none';
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    // ========= 登录/注册模态框交互 =========
    const modal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    function openModal() {
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('active'); }, 10);
    }
    function closeModalFunc() {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.querySelector('.tab-btn[data-tab="login"]')?.click();
            openModal();
        });
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            document.querySelector('.tab-btn[data-tab="register"]')?.click();
            openModal();
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            updateUserStatus(null);
            alert('已退出登录');
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModalFunc);
    }
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (tab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });

    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const account = document.getElementById('loginAccount').value;
            const pwd = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            if (!account || !pwd) {
                alert('请填写完整信息');
                return;
            }
            
            const user = validateUser(account, pwd);
            if (user) {
                currentUser = user;
                updateUserStatus(user);
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                closeModalFunc();
                alert(`欢迎回来，${user.username}！`);
            } else {
                alert('用户名或密码错误');
            }
        });
    }

    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const pwd = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;
            
            if (!username || !email || !pwd || !confirm) {
                alert('请填写完整信息');
                return;
            }
            if (pwd !== confirm) {
                alert('两次密码不一致');
                return;
            }
            if (pwd.length < 6) {
                alert('密码长度至少6位');
                return;
            }
            
            const result = registerUser(username, email, pwd);
            if (result.success) {
                alert('注册成功！请登录');
                document.querySelector('.tab-btn[data-tab="login"]').click();
            } else {
                alert(result.message);
            }
        });
    }

    // 第三方登录
    document.getElementById('wechatLogin')?.addEventListener('click', () => alert('微信登录（演示）'));
    document.getElementById('qqLogin')?.addEventListener('click', () => alert('QQ登录（演示）'));
    document.getElementById('weiboLogin')?.addEventListener('click', () => alert('微博登录（演示）'));

    // 滚动引导隐藏
    const scrollGuide = document.getElementById('scrollGuide');
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight * 0.2 && scrollGuide) {
            scrollGuide.style.opacity = '0';
            setTimeout(() => { if(scrollGuide) scrollGuide.style.display = 'none'; }, 500);
        }
    });

    // 移动端菜单
    const toggleBtn = document.getElementById('menuToggle');
    const navLinksDiv = document.getElementById('navLinks');
    if (toggleBtn && navLinksDiv) {
        toggleBtn.addEventListener('click', () => {
            navLinksDiv.classList.toggle('active');
        });
    }

    // 页面加载自动登录
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const validUser = users.find(u => u.id === user.id);
            if (validUser) {
                currentUser = validUser;
                updateUserStatus(validUser);
            }
        } catch (e) {
            console.error('解析用户数据失败:', e);
        }
    }

    // ========= 轮播图功能 =========
    (function(){
        const track = document.getElementById('carouselTrack');
        const dotsWrap = document.getElementById('carouselDots');
        const prevBtn = document.getElementById('prevArrow');
        const nextBtn = document.getElementById('nextArrow');
        const container = document.getElementById('carouselContainer');
        if(!track || !dotsWrap || !prevBtn || !nextBtn || !container) return;
        
        const AUTOPLAY_MS = 5000, RESUME_DELAY = 100;
        let timer = null, resumeTimer = null, isAnimating = false;
        const originalCards = Array.from(track.children);
        const total = originalCards.length;
        let current = 1;

        function getStepX() {
            const cards = Array.from(track.children);
            if(cards.length<2) return 0;
            return cards[1].offsetLeft - cards[0].offsetLeft;
        }
        function setTransition(enable) {
            track.style.transition = enable ? `transform 600ms cubic-bezier(0.22,1,0.36,1)` : 'none';
        }
        function moveTo(index, withAnim = true) {
            setTransition(withAnim);
            const step = getStepX();
            track.style.transform = `translate3d(${-index * step}px,0,0)`;
        }
        function buildClones() {
            const first = originalCards[0].cloneNode(true);
            const last = originalCards[total-1].cloneNode(true);
            track.insertBefore(last, track.firstChild);
            track.appendChild(first);
            current = 1;
            requestAnimationFrame(()=>moveTo(current, false));
        }
        function renderDots() {
            dotsWrap.innerHTML = '';
            for(let i=0;i<total;i++){
                const dot=document.createElement('button');
                dot.className='dot'+(i===0?' active':'');
                dot.addEventListener('click',()=>{
                    current = i+1;
                    moveTo(current,true);
                    syncDots();
                    restartAutoplay();
                });
                dotsWrap.appendChild(dot);
            }
        }
        function syncDots(){
            const realIndex = (current-1+total)%total;
            Array.from(dotsWrap.children).forEach((dot,i)=>{
                dot.classList.toggle('active', i===realIndex);
            });
        }
        function next(){
            if(isAnimating) return;
            isAnimating=true;
            current++;
            moveTo(current,true);
        }
        function prev(){
            if(isAnimating) return;
            isAnimating=true;
            current--;
            moveTo(current,true);
        }
        track.addEventListener('transitionend',()=>{
            if(current===total+1){
                current=1;
                moveTo(current,false);
            }else if(current===0){
                current=total;
                moveTo(current,false);
            }
            syncDots();
            isAnimating=false;
        });
        function startAutoplay(){
            if(timer) clearInterval(timer);
            timer = setInterval(next, AUTOPLAY_MS);
        }
        function stopAutoplay(){
            if(timer) clearInterval(timer);
            timer=null;
        }
        function restartAutoplay(){
            stopAutoplay();
            startAutoplay();
        }
        container.addEventListener('mouseenter',()=>{
            clearTimeout(resumeTimer);
            stopAutoplay();
        });
        container.addEventListener('mouseleave',()=>{
            clearTimeout(resumeTimer);
            resumeTimer=setTimeout(startAutoplay, RESUME_DELAY);
        });
        prevBtn.addEventListener('click',()=>{ prev(); restartAutoplay(); });
        nextBtn.addEventListener('click',()=>{ next(); restartAutoplay(); });
        window.addEventListener('resize',()=>{
            requestAnimationFrame(()=>moveTo(current, false));
        });
        buildClones();
        renderDots();
        syncDots();
        startAutoplay();
    })();
});
// 修复滚动提示消失问题
document.addEventListener('DOMContentLoaded', function() {
    const scrollGuideBox = document.querySelector('.scroll-guide-box');
    const scrollGuide = document.getElementById('scrollGuide');
    const clickGuide = document.getElementById('clickGuide');
    
    // 强制显示提示框（清除可能的隐藏状态）
    if (scrollGuideBox) {
        scrollGuideBox.style.display = 'flex';
        scrollGuideBox.classList.remove('fade-out');
        
        // 3秒后自动隐藏（可调整时间）
        setTimeout(() => {
            scrollGuideBox.classList.add('fade-out');
        }, 3000);
        
        // 滚动后立即隐藏
        window.addEventListener('scroll', function() {
            scrollGuideBox.classList.add('fade-out');
        }, { once: true }); // 只执行一次
    }
});