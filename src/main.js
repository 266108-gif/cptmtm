import './css/style.css';
import './css/screens.css';
import './css/animations.css';

import { audio } from './audio.js';
import { 
  onAuthChange, 
  loginEmail, 
  registerEmail, 
  loginGuest, 
  logout, 
  saveScore,
  isUsingMock 
} from './firebase.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { loadStage1 } from './stages/stage1.js';
import { loadStage2 } from './stages/stage2.js';
import { loadStage3 } from './stages/stage3.js';

class GameEngine {
  constructor() {
    this.currentUser = null;
    this.timerInterval = null;
    this.timeLeft = 300; // 5 minutes
    this.currentStage = 1;
    this.inventory = [];
    this.hasToast = false; // Ending flag
    this.busAmbientSound = null;
  }

  init() {
    // Listen to Firebase Auth state
    onAuthChange((user) => {
      this.currentUser = user;
      if (user) {
        this.showLobbyScreen();
      } else {
        this.showAuthScreen();
      }
    });
  }

  // ==========================================
  // ROUTER / SCREENS SWAP
  // ==========================================

  getAppEl() {
    return document.getElementById('app');
  }

  showAuthScreen() {
    const app = this.getAppEl();
    app.innerHTML = `
      <div class="screen auth-screen">
        <div class="auth-card">
          <div class="auth-title">초고속 등교 작전</div>
          <div style="font-size: 13px; text-align: center; color: var(--color-text-muted); margin-top: -12px;">
            20분 안에 온갖 방해를 뚫고 등교하라!
          </div>
          
          <form id="auth-form" class="auth-form">
            <input type="email" id="auth-email" placeholder="이메일 주소" required>
            <input type="password" id="auth-password" placeholder="비밀번호 (6자 이상)" required>
            
            <div id="auth-error-msg" class="auth-error" style="display: none;"></div>
            
            <button type="submit" id="auth-submit-btn" class="auth-btn">로그인</button>
            <button type="button" id="auth-guest-btn" class="auth-btn secondary">로그인 없이 게스트로 시작</button>
          </form>

          <div id="auth-switch-mode" class="auth-switch">
            계정이 없으신가요? <span>회원가입</span>
          </div>
        </div>
      </div>
    `;

    // Auth screen controller
    let isLoginMode = true;
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const errorMsg = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('auth-submit-btn');
    const guestBtn = document.getElementById('auth-guest-btn');
    const switchMode = document.getElementById('auth-switch-mode');

    switchMode.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      errorMsg.style.display = 'none';
      if (isLoginMode) {
        submitBtn.innerText = "로그인";
        switchMode.innerHTML = "계정이 없으신가요? <span>회원가입</span>";
      } else {
        submitBtn.innerText = "회원가입";
        switchMode.innerHTML = "이미 계정이 있으신가요? <span>로그인</span>";
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      audio.init();
      audio.playClick();
      errorMsg.style.display = 'none';

      const email = emailInput.value.trim();
      const pw = passwordInput.value;

      try {
        submitBtn.disabled = true;
        submitBtn.innerText = isLoginMode ? "로그인 중..." : "회원가입 중...";
        
        if (isLoginMode) {
          await loginEmail(email, pw);
        } else {
          await registerEmail(email, pw);
        }
      } catch (err) {
        errorMsg.innerText = err.message || "오류가 발생했습니다.";
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerText = isLoginMode ? "로그인" : "회원가입";
      }
    });

    guestBtn.addEventListener('click', async () => {
      audio.init();
      audio.playClick();
      try {
        guestBtn.disabled = true;
        guestBtn.innerText = "로그인 중...";
        await loginGuest();
      } catch (err) {
        errorMsg.innerText = "게스트 로그인 실패";
        errorMsg.style.display = 'block';
        guestBtn.disabled = false;
        guestBtn.innerText = "로그인 없이 게스트로 시작";
      }
    });
  }

  showLobbyScreen() {
    audio.init();
    audio.stopBgm();
    
    const app = this.getAppEl();
    const isGuest = this.currentUser.isAnonymous;
    const emailText = isGuest ? "게스트 플레이어" : this.currentUser.email;

    app.innerHTML = `
      <div class="screen lobby-screen">
        <div class="lobby-card">
          <div class="lobby-header">
            <div class="lobby-title">초고속 등교 작전</div>
            <div class="lobby-subtitle">포인트 앤 클릭 코믹 스릴러</div>
          </div>

          <div class="lobby-user-info">
            <span>👤 ${emailText}</span>
            <button id="lobby-logout-btn" class="logout-btn">로그아웃</button>
          </div>

          <button id="lobby-start-btn" class="lobby-main-btn">게임 시작 (기상하기)</button>

          <!-- Leaderboard Panel -->
          <div id="lobby-leaderboard" style="border-top: 1px solid var(--glass-border); padding-top: 12px;"></div>
        </div>
      </div>
    `;

    document.getElementById('lobby-logout-btn').addEventListener('click', () => {
      audio.playClick();
      logout();
    });

    document.getElementById('lobby-start-btn').addEventListener('click', () => {
      audio.playClick();
      this.startGame();
    });

    // Render leaderboard
    renderLeaderboard(document.getElementById('lobby-leaderboard'));
  }

  startGame() {
    // Reset engine state
    this.timeLeft = 300; // 5:00
    this.currentStage = 1;
    this.inventory = [];
    this.hasToast = false;
    this.stopTimer();

    const app = this.getAppEl();
    
    // Play clock tick sequence for intro
    app.innerHTML = `
      <div class="screen intro-sleep-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:black; color:white; width:100%; height:100%; text-align:center;">
        <div id="intro-clock-container" style="display:flex; flex-direction:column; align-items:center; gap:24px;">
          <!-- Twin Bell Alarm Clock SVG -->
          <svg width="150" height="150" viewBox="0 0 120 120" id="intro-alarm-clock" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); transition: transform 0.15s; transform-origin: 60px 65px;">
            <!-- Legs -->
            <rect x="25" y="102" width="12" height="18" fill="#cbd5e1" transform="rotate(-15 25 102)" rx="3"/>
            <rect x="83" y="102" width="12" height="18" fill="#cbd5e1" transform="rotate(15 83 102)" rx="3"/>
            
            <!-- Twin Bells on top -->
            <path d="M20 25 C12 12, 32 2, 42 18 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <path d="M100 25 C108 12, 88 2, 78 18 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            
            <!-- Hammer -->
            <rect x="58" y="10" width="4" height="12" fill="#94a3b8"/>
            <circle cx="60" cy="8" r="6" fill="#475569"/>
            
            <!-- Metal legs connectors -->
            <line x1="28" y1="22" x2="42" y2="35" stroke="silver" stroke-width="3"/>
            <line x1="92" y1="22" x2="78" y2="35" stroke="silver" stroke-width="3"/>
            
            <!-- Handle -->
            <path d="M38 18 Q60 5 82 18" fill="none" stroke="silver" stroke-width="3" stroke-linecap="round"/>
            
            <!-- Main Body Circular -->
            <circle cx="60" cy="65" r="42" fill="#ef4444" stroke="#b91c1c" stroke-width="3.5"/>
            <!-- Inner face -->
            <circle cx="60" cy="65" r="35" fill="white" stroke="#94a3b8" stroke-width="1"/>
            
            <!-- Clock Hands -->
            <!-- Hour Hand (pointing near 8) -->
            <line x1="60" y1="65" x2="42" y2="73" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
            <!-- Minute Hand (pointing at 9 minutes, representing 08:09) -->
            <line id="intro-minute-hand" x1="60" y1="65" x2="38" y2="52" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" style="transform-origin: 60px 65px; transition: transform 0.5s;"/>
            
            <!-- Ticking Second Hand -->
            <line id="intro-second-hand" x1="60" y1="65" x2="60" y2="38" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round" style="transform-origin: 60px 65px; transition: transform 0.1s cubic-bezier(0.8, 0, 0.2, 1); transform: rotate(0deg);"/>
            
            <!-- Center Pin -->
            <circle cx="60" cy="65" r="4" fill="#1e293b"/>
            <circle cx="60" cy="65" r="1.5" fill="white"/>
          </svg>
          
          <div id="intro-clock-text" style="font-family: var(--font-digital); font-size:48px; color:#475569; text-shadow:0 0 10px rgba(255,255,255,0.05); font-weight:700; transition: color 0.5s, text-shadow 0.5s;">08:09</div>
          <div id="intro-subtitle" style="font-size:14px; color:var(--color-text-muted); font-weight:500; transition: color 0.3s;">주인공은 깊은 잠에 빠져 있다...</div>
        </div>
      </div>
    `;

    // 0s: Tick
    audio.playTick(false);
    
    // 1.0s: Tock (Move second hand by 30 degrees, represents clock ticking!)
    setTimeout(() => {
      audio.playTick(true);
      const secHand = document.getElementById('intro-second-hand');
      if (secHand) {
        secHand.style.transform = 'rotate(30deg)';
      }
    }, 1000);

    // 1.8s: Alarm goes off!
    let alarm = null;
    setTimeout(() => {
      const clockSvg = document.getElementById('intro-alarm-clock');
      const minHand = document.getElementById('intro-minute-hand');
      const secHand = document.getElementById('intro-second-hand');
      const clockText = document.getElementById('intro-clock-text');
      const subtitleEl = document.getElementById('intro-subtitle');
      
      // Ring the clock visually (add vibration)
      if (clockSvg) {
        clockSvg.classList.add('vibrate-alarm');
      }
      // Minute hand advances to 10 minutes position (rotate slightly)
      if (minHand) {
        minHand.style.transform = 'rotate(6deg)';
      }
      // Second hand spins wildly
      if (secHand) {
        secHand.style.transition = 'transform 0.15s linear';
        secHand.style.transform = 'rotate(720deg)';
      }
      // Text turns red and digital clock ticks to 08:10
      if (clockText) {
        clockText.innerText = "08:10";
        clockText.style.color = "#f43f5e";
        clockText.style.textShadow = "0 0 20px #f43f5e";
      }
      if (subtitleEl) {
        subtitleEl.innerText = "따르릉!!! 따르릉!!!";
        subtitleEl.style.color = "#f43f5e";
      }
      alarm = audio.playAlarm();
    }, 1800);

    // 3.8s: Transition to bedroom
    setTimeout(() => {
      app.innerHTML = `
        <div class="screen game-screen">
          <!-- HUD Header -->
          <header class="game-header">
            <div class="game-title">
              <span>🏃</span>
              <span id="hud-stage-title">1단계: 내 방</span>
              <span id="hud-stage-objective" class="stage-badge">교복 확보하기</span>
            </div>
            <div class="timer-container">
              <span class="timer-label">남은 시간</span>
              <span id="hud-timer" class="timer-display">05:00</span>
            </div>
          </header>

          <!-- Stage Action Area -->
          <div id="stage-viewport" class="stage-viewport"></div>

          <!-- HUD Footer (Inventory & Speech Bubble) -->
          <footer class="game-footer">
            <!-- Inventory Slots -->
            <div class="inventory-bar" id="hud-inventory">
              <!-- Render slots dynamically -->
            </div>
            
            <!-- Dialogue Speech Bubble -->
            <div class="dialogue-box">
              <div id="hud-speaker" class="dialogue-speaker">알람시계</div>
              <div id="hud-dialogue" class="dialogue-text">알람이 미친 듯이 울린다... 어서 일어나서 준비해야 해!</div>
            </div>
          </footer>
        </div>
      `;

      this.renderInventory();
      this.loadCurrentStage(alarm);
    }, 3800);
  }

  // ==========================================
  // GAMEPLAY ENGINE APIs
  // ==========================================

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateHudTimer();
      
      // Play a ticking noise in Stage 2 (when lights are out, creates tension)
      if (this.currentStage === 2 && document.getElementById('dark-filter') && !document.getElementById('dark-filter').classList.contains('turned-on')) {
        audio.playTick(this.timeLeft % 2 === 0);
      }

      if (this.timeLeft <= 0) {
        this.triggerEnding(false); // Fail Ending
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  subtractTime(seconds) {
    this.timeLeft -= seconds;
    if (this.timeLeft < 0) this.timeLeft = 0;
    this.updateHudTimer();

    // Show visual penalty toast
    const container = document.getElementById('game-container');
    const toast = document.createElement('div');
    toast.className = 'toast-penalty';
    toast.innerText = `시간 패널티 -${seconds}초!`;
    container.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => toast.remove(), 1200);

    if (this.timeLeft === 0) {
      this.triggerEnding(false);
    }
  }

  flashScreenDamage() {
    const viewport = document.getElementById('stage-viewport');
    viewport.classList.add('shake-screen');
    
    const flash = document.createElement('div');
    flash.className = 'damage-flash';
    viewport.appendChild(flash);

    setTimeout(() => {
      viewport.classList.remove('shake-screen');
      flash.remove();
    }, 500);
  }

  showVisualPenalty(type, duration) {
    const viewport = document.getElementById('stage-viewport');
    if (!viewport) return;

    // Create penalty overlay
    const overlay = document.createElement('div');
    overlay.className = `penalty-overlay penalty-${type}`;
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.zIndex = '500';
    overlay.style.pointerEvents = 'none';

    if (type === 'pajamas') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(99,102,241,0.25);">
          <span style="font-size:28px; font-weight:900; color:white; text-shadow:0 0 10px var(--color-primary); animation:vibrate-alarm 0.5s infinite;">zZZ...</span>
          <span style="font-size:14px; font-weight:700; color:#a5b4fc; margin-top:10px;">잠옷을 만지는 순간 깊은 숙면의 파동이 밀려온다!</span>
        </div>
      `;
      const stageBg = viewport.firstElementChild;
      if (stageBg) {
        stageBg.style.filter = 'blur(4px)';
        setTimeout(() => { stageBg.style.filter = 'none'; }, duration);
      }
    } else if (type === 'space') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; border:20px solid #475569; border-radius:30px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(15,23,42,0.35);">
          <span style="font-size:40px; animation:ring 1s infinite;">🛰️👩‍🚀</span>
          <span style="font-weight:700; color:#a5f3fc; font-size:14px; margin-top:10px; text-shadow:0 0 8px #0891b2;">우주복의 관성! 중력이 10배 무거워졌다!</span>
        </div>
      `;
    } else if (type === 'ice') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; border:15px solid #a5f3fc; box-shadow:inset 0 0 45px #a5f3fc; background:rgba(165,243,252,0.15); display:flex; justify-content:center; align-items:center;">
          <span style="font-weight:700; color:#0891b2; font-size:15px; text-shadow:0 0 8px white; animation:ring 0.1s infinite;">덜덜덜... 냉방 가동! 얼어붙을 것 같다! ❄️</span>
        </div>
      `;
    } else if (type === 'heat') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; background:radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(244,63,94,0.4) 100%); display:flex; justify-content:center; align-items:center; animation: screenShake 0.15s infinite;">
          <span style="font-weight:700; color:white; font-size:16px; text-shadow:0 0 10px #f43f5e;">온수 가동! 찜통 가마솥 사우나 돌입! 🔥</span>
        </div>
      `;
    } else if (type === 'tv') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; background:black; border:8px solid #334155; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <svg width="60" height="45" viewBox="0 0 40 30" style="animation: okPop 0.4s infinite alternate;">
            <rect width="40" height="30" fill="#f43f5e" rx="3"/>
            <polygon points="15,10 28,15 15,20" fill="white"/>
          </svg>
          <span style="font-weight:700; color:white; font-size:13px; margin-top:8px;">★애니 본방 사수 중★ (시선 강탈!)</span>
        </div>
      `;
    } else if (type === 'vacuum') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; background:rgba(244,63,94,0.1); position:relative; overflow:hidden;">
          <div style="position:absolute; bottom:15px; left:-100px; width:70px; height:40px; animation: vacuumRun 2s linear forwards;">
            <svg width="70" height="40" viewBox="0 0 80 45">
              <ellipse cx="40" cy="25" rx="35" ry="18" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
              <circle cx="65" cy="25" r="5" fill="#38bdf8"/>
            </svg>
          </div>
          <div style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); font-weight:700; color:white; font-size:14px; text-shadow:0 2px 4px black; animation:vibrate-alarm 0.2s infinite;">청소기와 충돌! 발목 슬라이딩! 꽈당!</div>
        </div>
      `;
    } else if (type === 'fire') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; background:radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(127,29,29,0.5) 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; animation: screenShake 0.15s infinite;">
          <span style="font-size:44px; animation: floatAnim 0.3s infinite alternate;">🔥👄🔥</span>
          <span style="font-weight:700; color:white; font-size:14px; text-shadow:0 0 10px #ef4444; margin-top:8px;">입에서 불이 나온다! 매워!!! 핫뜨거!</span>
        </div>
      `;
    } else if (type === 'crack') {
      overlay.innerHTML = `
        <div style="width:100%; height:100%; background:rgba(165,243,252,0.15); display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <svg width="100%" height="100%" viewBox="0 0 400 250" style="position:absolute; top:0; left:0;">
            <path d="M0 0 L150 100 L200 90 L400 250 M150 100 L120 180 M200 90 L280 40 L380 90 M280 40 L260 0" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9" style="filter: drop-shadow(0 0 2px #a5f3fc);"/>
          </svg>
          <span style="font-weight:700; color:#38bdf8; font-size:15px; text-shadow:0 0 8px white; z-index:2; margin-top:60px;">쩡쩌적! 이가 깨질 것 같은 극강의 단단함!</span>
        </div>
      `;
    }

    viewport.appendChild(overlay);

    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); }, 500);
    }, duration - 500);
  }

  updateHudTimer() {
    const hudTimer = document.getElementById('hud-timer');
    if (!hudTimer) return;

    if (this.timeLeft <= 0) {
      hudTimer.innerText = "00:00";
      return;
    }

    const m = Math.floor(this.timeLeft / 60);
    const s = Math.floor(this.timeLeft % 60);
    hudTimer.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateStageTitle(title, objective) {
    const titleEl = document.getElementById('hud-stage-title');
    const objEl = document.getElementById('hud-stage-objective');
    if (titleEl) titleEl.innerText = title;
    if (objEl) objEl.innerText = objective;
  }

  setDialogue(speaker, text) {
    const speakerEl = document.getElementById('hud-speaker');
    const dialogEl = document.getElementById('hud-dialogue');
    if (speakerEl) speakerEl.innerText = speaker;
    if (dialogEl) dialogEl.innerText = text;
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================

  addToInventory(itemId, itemIcon) {
    this.inventory.push({ id: itemId, icon: itemIcon });
    this.renderInventory();
  }

  removeFromInventory(itemId) {
    this.inventory = this.inventory.filter(item => item.id !== itemId);
    this.renderInventory();
  }

  hasItem(itemId) {
    return this.inventory.some(item => item.id === itemId);
  }

  clearInventory() {
    this.inventory = [];
    this.renderInventory();
  }

  renderInventory() {
    const invBar = document.getElementById('hud-inventory');
    if (!invBar) return;

    invBar.innerHTML = '';
    // Draw 3 slots
    for (let i = 0; i < 3; i++) {
      const item = this.inventory[i];
      const slot = document.createElement('div');
      slot.className = `inventory-slot ${item ? 'active' : ''}`;
      
      if (item) {
        slot.innerHTML = `<span style="font-size: 26px;">${item.icon}</span>`;
      }
      
      invBar.appendChild(slot);
    }
  }

  // ==========================================
  // STAGES SWITCHING
  // ==========================================

  loadCurrentStage(incomingAlarm = null) {
    if (this.currentStage > 1) {
      audio.playSuccessFanfare();
    }
    if (this.currentStage === 1) {
      loadStage1(this, incomingAlarm);
    } else if (this.currentStage === 2) {
      loadStage2(this);
    } else if (this.currentStage === 3) {
      loadStage3(this);
    }
  }

  nextStage() {
    this.currentStage++;
    this.loadCurrentStage();
  }

  setHasToast(val) {
    this.hasToast = val;
  }

  // ==========================================
  // ENDING CONTROLLERS
  // ==========================================

  triggerEnding(isSuccess) {
    this.stopTimer();
    audio.stopBgm();
    
    if (this.busAmbientSound) {
      this.busAmbientSound.stop();
      this.busAmbientSound = null;
    }

    if (isSuccess) {
      this.showSuccessEnding();
    } else {
      this.showFailureEnding();
    }
  }

  showSuccessEnding() {
    audio.playSuccessFanfare();
    
    // Play romantic muffled BGM and bus motor rumble after a brief moment
    setTimeout(() => {
      this.busAmbientSound = audio.startBusRumble();
      audio.startBgm('soft');
    }, 1000);

    const app = this.getAppEl();
    const remainingTime = this.timeLeft;
    
    // Calculate formatted clear time
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    const clearTimeStr = `${minutes}분 ${seconds}초`;

    app.innerHTML = `
      <div class="screen ending-screen">
        <div class="ending-card" style="max-width: 540px;">
          <div class="ending-title-success">🚌 버스 탑승 성공!</div>
          
          <!-- Moving Bus Graphic -->
          <div class="bus-animation-box" id="ending-anim-frame">
            <div class="scrolling-bg"></div>
            <!-- School Bus -->
            <!-- School Bus SVG -->
            <div class="bus-sprite" style="padding:0; overflow:hidden;">
              <svg width="100%" height="100%" viewBox="0 0 120 70">
                <rect x="15" y="10" width="20" height="20" fill="#a5f3fc" rx="2"/>
                <rect x="45" y="10" width="20" height="20" fill="#a5f3fc" rx="2"/>
                <rect x="75" y="10" width="30" height="20" fill="#a5f3fc" rx="2"/>
                <circle cx="30" cy="55" r="8" fill="#1e293b"/>
                <circle cx="30" cy="55" r="3" fill="#cbd5e1"/>
                <circle cx="90" cy="55" r="8" fill="#1e293b"/>
                <circle cx="90" cy="55" r="3" fill="#cbd5e1"/>
              </svg>
            </div>
            
            <!-- Character interior frame -->
            <div id="bus-interior" style="position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: none; flex-direction: column; justify-content: center; align-items: center; gap: 8px;">
              <div style="display: flex; gap: 40px; align-items: center;">
                <!-- Hero with heart beats -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div id="hero-blush" class="character-head" style="position: relative; width: 48px; height: 48px; border-radius: 50%; background: #fed7aa; border: 2px solid #ea580c; overflow: visible;">
                    <svg width="44" height="44" viewBox="0 0 44 44" style="position: absolute; top:0; left:0;">
                      <circle cx="10" cy="24" r="5" fill="#f43f5e" opacity="0.6"/>
                      <circle cx="34" cy="24" r="5" fill="#f43f5e" opacity="0.6"/>
                      <path d="M12 16 L18 22 M18 16 L12 22" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
                      <path d="M32 16 L26 22 M26 16 L32 22" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
                      <path d="M20 28 Q22 26 24 28 T28 28" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </svg>
                    ${this.hasToast ? '<div class="toast-mouth"></div>' : ''}
                  </div>
                  <span class="heart-beat" style="display:inline-block; margin-top: 4px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#f43f5e">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </span>
                </div>
                
                <!-- Bus Handle SVG -->
                <div style="width: 32px; height: 50px;">
                  <svg width="32" height="50" viewBox="0 0 32 50">
                    <rect x="14" y="0" width="4" height="25" fill="#475569"/>
                    <path d="M6 25 L26 25 L16 43 Z" fill="none" stroke="silver" stroke-width="4" stroke-linejoin="round"/>
                  </svg>
                </div>
                
                <!-- Girl sitting with headphones -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div class="character-head" style="position: relative; width: 48px; height: 48px; border-radius: 50%; background: #fed7aa; border: 2px solid #ea580c; overflow: visible;">
                    <svg width="44" height="44" viewBox="0 0 44 44" style="position: absolute; top:0; left:0;">
                      <circle cx="8" cy="24" r="3" fill="#f43f5e" opacity="0.4"/>
                      <circle cx="36" cy="24" r="3" fill="#f43f5e" opacity="0.4"/>
                      <path d="M12 18 Q16 21 18 18" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <path d="M26 18 Q28 21 32 18" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <path d="M20 26 Q22 29 24 26" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <path d="M6 16 Q22 4 38 16" stroke="#818cf8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                      <rect x="2" y="16" width="6" height="14" fill="#4f46e5" rx="3"/>
                      <rect x="36" y="16" width="6" height="14" fill="#4f46e5" rx="3"/>
                    </svg>
                  </div>
                  <span style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">여학생</span>
                </div>
              </div>
              <div id="bus-subtitles" style="font-size: 13px; color: #a5b4fc; text-align: center; padding: 0 10px; font-weight: 500;">
                토스트를 입에 물고 만원 버스에 세이프!
              </div>
            </div>
          </div>

          <div style="font-size: 14px; color: var(--color-text-base); line-height: 1.5;">
            남은 시간: <span style="font-family: var(--font-digital); color: var(--color-success); font-size: 20px; font-weight: 700;">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span><br>
            당신은 지각 방지 특공대의 전설이 되었습니다!
          </div>

          <!-- Save Score section -->
          <div id="score-section" style="width: 100%; border-top: 1px solid var(--glass-border); padding-top: 12px;">
            <div style="font-size: 13px; color: var(--color-warning); font-weight: 600;">랭킹에 내 기록 등록하기</div>
            <form id="save-score-form" class="save-score-form">
              <input type="text" id="player-name" placeholder="닉네임 입력" maxlength="10" required>
              <button type="submit" id="save-score-btn">등록</button>
            </form>
            <div id="save-score-status" style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;"></div>
          </div>

          <div class="ending-btn-row">
            <button id="end-retry-btn" class="ending-btn">다시 하기</button>
            <button id="end-lobby-btn" class="ending-btn secondary">대기실로</button>
          </div>
        </div>
      </div>
    `;

    const animFrame = document.getElementById('ending-anim-frame');
    const busInterior = document.getElementById('bus-interior');
    const subEl = document.getElementById('bus-subtitles');
    const heroBlush = document.getElementById('hero-blush');

    // Run script drama
    setTimeout(() => {
      // Show bus interior romance scene
      busInterior.style.display = 'flex';
    }, 2000);

    setTimeout(() => {
      subEl.innerText = "헐레벌떡 손잡이를 잡는 순간, 눈길을 사로잡는 여학생이 보인다...";
    }, 4500);

    setTimeout(() => {
      heroBlush.classList.add('blush-glow');
      subEl.innerText = "눈이 마주치자 볼이 홍당무처럼 붉어졌다. 두근... 두근... ❤️";
    }, 7000);

    // Cookie video comedy after 9.5s
    setTimeout(() => {
      subEl.innerHTML = `<span style="color:var(--color-warning); font-weight:bold;">[쿠키 영상]</span><br>
        멋있는 척 폼을 잡고 서 있었지만... 아차! 입에 토스트가 그대로 물려있었다!!<br>
        그걸 본 여학생이 피식 웃음을 터뜨렸다. 😂`;
    }, 10500);

    // Bind Score saving
    const scoreForm = document.getElementById('save-score-form');
    const scoreBtn = document.getElementById('save-score-btn');
    const nameInput = document.getElementById('player-name');
    const scoreStatus = document.getElementById('save-score-status');

    scoreForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      audio.playClick();
      const name = nameInput.value.trim();
      if (!name) return;

      try {
        scoreBtn.disabled = true;
        scoreBtn.innerText = "저장 중..";
        
        await saveScore(name, remainingTime);
        
        scoreStatus.innerText = "성공적으로 등록되었습니다!";
        scoreStatus.style.color = "var(--color-success)";
        scoreForm.style.display = 'none';
      } catch (err) {
        console.error(err);
        scoreStatus.innerText = "등록에 실패했습니다.";
        scoreStatus.style.color = "var(--color-accent)";
        scoreBtn.disabled = false;
        scoreBtn.innerText = "등록";
      }
    });

    // Buttons
    document.getElementById('end-retry-btn').addEventListener('click', () => {
      audio.playClick();
      this.startGame();
    });

    document.getElementById('end-lobby-btn').addEventListener('click', () => {
      audio.playClick();
      this.showLobbyScreen();
    });
  }

  showFailureEnding() {
    audio.playFailure();

    const app = this.getAppEl();
    app.innerHTML = `
      <div class="screen ending-screen">
        <div class="ending-card" style="max-width: 500px;">
          <!-- Classroom scolding animation sequence -->
          <div class="bus-animation-box" id="fail-anim-frame" style="position: relative; width: 100%; height: 170px; background: linear-gradient(to bottom, #475569, #1e293b); border: 3px solid #64748b; border-radius: 8px; overflow: hidden; margin-bottom:15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom:10px;">
            <!-- Blackboard detail -->
            <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 280px; height: 40px; background: #064e3b; border: 3px solid #78350f; border-radius: 2px; box-shadow: inset 0 0 8px black; display: flex; justify-content: center; align-items: center; color: rgba(255,255,255,0.3); font-weight:bold; font-size:12px; font-family:var(--font-sans);">수학 II - 지각생 체벌 현장</div>
            
            <!-- Floor line -->
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 25px; background: #64748b; border-top: 2px solid #94a3b8;"></div>

            <!-- Drama actors -->
            <div style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; gap: 40px; align-items: flex-end; z-index: 10; padding-bottom:5px;">
              <!-- Angry Teacher SVG -->
              <div id="fail-teacher" style="display: none; align-items: center; flex-direction: column;">
                <svg width="70" height="110" viewBox="0 0 80 130">
                  <!-- Hair -->
                  <path d="M20 20 Q40 0 60 20 L65 40 L15 40 Z" fill="#1e1b4b"/>
                  <!-- Face -->
                  <circle cx="40" cy="30" r="15" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
                  <!-- Eyebrows (angry) -->
                  <line x1="28" y1="22" x2="37" y2="27" stroke="black" stroke-width="2.5"/>
                  <line x1="52" y1="22" x2="43" y2="27" stroke="black" stroke-width="2.5"/>
                  <circle cx="33" cy="28" r="2" fill="black"/>
                  <circle cx="47" cy="28" r="2" fill="black"/>
                  <!-- Red angry cross vein -->
                  <path d="M52 15 L58 21 M58 15 L52 21" stroke="red" stroke-width="2"/>
                  <!-- Mouth -->
                  <path d="M33 38 Q40 33 47 38" stroke="black" stroke-width="2.5" fill="none"/>
                  <!-- Glasses -->
                  <circle cx="33" cy="28" r="5" fill="none" stroke="black" stroke-width="1.5"/>
                  <circle cx="47" cy="28" r="5" fill="none" stroke="black" stroke-width="1.5"/>
                  <line x1="38" y1="28" x2="42" y2="28" stroke="black" stroke-width="1.5"/>
                  <!-- Suit body -->
                  <rect x="22" y="45" width="36" height="50" fill="#334155" rx="4"/>
                  <!-- Arm holding stick -->
                  <path d="M22 55 L5 80" stroke="#fed7aa" stroke-width="4" stroke-linecap="round"/>
                  <line x1="5" y1="80" x2="-20" y2="105" stroke="#a16207" stroke-width="3.5" stroke-linecap="round"/>
                  <!-- Legs -->
                  <rect x="28" y="95" width="8" height="30" fill="#1e293b"/>
                  <rect x="44" y="95" width="8" height="30" fill="#1e293b"/>
                </svg>
              </div>

              <!-- Crying Hero holding water buckets -->
              <div id="fail-punished-hero" style="display: none; align-items: center; flex-direction: column;">
                <svg width="85" height="110" viewBox="0 0 90 120">
                  <!-- Arms holding buckets -->
                  <line x1="30" y1="50" x2="10" y2="50" stroke="#fed7aa" stroke-width="5" stroke-linecap="round"/>
                  <line x1="60" y1="50" x2="80" y2="50" stroke="#fed7aa" stroke-width="5" stroke-linecap="round"/>
                  <!-- Left Bucket -->
                  <path d="M5 50 L5 70 L15 70 L15 50 Z" fill="#cbd5e1" stroke="#475569"/>
                  <rect x="3" y="55" width="14" height="2" fill="#38bdf8"/>
                  <path d="M5 50 Q10 44 15 50" stroke="silver" stroke-width="1" fill="none"/>
                  <!-- Right Bucket -->
                  <path d="M75 50 L75 70 L85 70 L85 50 Z" fill="#cbd5e1" stroke="#475569"/>
                  <rect x="73" y="55" width="14" height="2" fill="#38bdf8"/>
                  <path d="M75 50 Q80 44 85 50" stroke="silver" stroke-width="1" fill="none"/>
                  <!-- Body -->
                  <rect x="25" y="40" width="40" height="45" fill="#1e3a8a" rx="5"/>
                  <!-- Kneeling Legs -->
                  <path d="M25 85 L15 100 L30 105 Z" fill="#172554"/>
                  <path d="M65 85 L75 100 L60 105 Z" fill="#172554"/>
                  <!-- Head -->
                  <circle cx="45" cy="22" r="16" fill="#fed7aa" stroke="#ea580c" stroke-width="1"/>
                  <!-- Tears -->
                  <path d="M37 24 Q37 40 34 45 M53 24 Q53 40 56 45" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" style="animation: vibrate-alarm 0.1s infinite;"/>
                  <!-- Eyes -->
                  <path d="M33 20 L39 22 M57 20 L51 22" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>

            <!-- Subtitle -->
            <div id="fail-subtitles" style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.85); color: #fda4af; text-align: center; padding: 6px 10px; font-size: 12px; font-weight: 500; z-index: 20; min-height:36px; display:flex; justify-content:center; align-items:center;">
              지각 확정... 무자비하게 학교 정문이 굳게 닫혔다.
            </div>
          </div>

          <div class="ending-title-fail">지각 확정...</div>
          
          <div style="font-size: 13.5px; color: var(--color-text-muted); line-height: 1.5; margin: 12px 0;">
            어스름한 먼지 너머로 무섭게 화가 난 담임 선생님의<br>
            얼굴이 아른거립니다... 아침 조회가 시작되었습니다.<br>
            <span style="color:var(--color-accent); font-weight:700;">GAME OVER</span>
          </div>

          <div class="ending-btn-row">
            <button id="end-retry-btn" class="ending-btn accent">재도전</button>
            <button id="end-lobby-btn" class="ending-btn secondary">대기실로</button>
          </div>
        </div>
      </div>
    `;

    const failSub = document.getElementById('fail-subtitles');
    const failTeacher = document.getElementById('fail-teacher');
    const failHero = document.getElementById('fail-punished-hero');

    // Run failure drama timing sequence
    setTimeout(() => {
      if (failTeacher) failTeacher.style.display = 'flex';
      if (failSub) failSub.innerText = "교실 뒷문이 벌컥 열리며, 눈에서 레이저를 쏘아 대는 담임 선생님이 등장했다!";
    }, 2000);

    setTimeout(() => {
      if (failHero) failHero.style.display = 'flex';
      if (failSub) failSub.innerHTML = `<span style="color:#ef4444; font-weight:bold;">선생님:</span> "주인공! 또 지각이냐?! 당장 뒤로 가서 무릎 꿇고 물버킷 들고 서 있어!"`;
    }, 4800);

    setTimeout(() => {
      if (failSub) failSub.innerHTML = `<span style="color:#a5f3fc; font-weight:bold;">주인공:</span> "으아앙... 이불에서 더 빨리 나올걸... 오늘 당번 청소는 망했다... 😭"`;
    }, 8000);

    document.getElementById('end-retry-btn').addEventListener('click', () => {
      audio.playClick();
      this.startGame();
    });

    document.getElementById('end-lobby-btn').addEventListener('click', () => {
      audio.playClick();
      this.showLobbyScreen();
    });
  }
}

// Instantiate and start engine
const engine = new GameEngine();
window.addEventListener('DOMContentLoaded', () => {
  engine.init();
});
export default engine;
