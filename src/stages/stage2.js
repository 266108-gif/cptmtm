import { audio } from '../audio.js';
import { showOkEffect } from '../components/ok-effect.js';

export function loadStage2(gameEngine) {
  const viewport = document.getElementById('stage-viewport');
  
  // Set stage title
  gameEngine.updateStageTitle("2단계: 거실", "소지품 챙기기");
  
  let isLightOn = false;
  let hasBackpack = false;
  let hasWallet = false;
  let activeModal = false;

  // Custom SVG strings for inventory slots
  const backpackSvg = `
    <svg width="26" height="26" viewBox="0 0 45 52" style="transform: translateY(-2px);">
      <rect x="5" y="10" width="35" height="40" fill="#0284c7" rx="10" stroke="#075985" stroke-width="3"/>
      <rect x="10" y="26" width="25" height="20" fill="#0ea5e9" rx="5" stroke="#075985" stroke-width="2"/>
      <path d="M15 10 Q22.5 2 30 10" stroke="#075985" stroke-width="3.5" fill="none"/>
    </svg>
  `;

  const walletSvg = `
    <svg width="26" height="26" viewBox="0 0 35 25">
      <rect width="35" height="25" fill="#312e81" rx="3" stroke="#1e1b4b" stroke-width="2"/>
      <rect x="4" y="8" width="7" height="6" fill="gold" rx="1"/>
    </svg>
  `;

  const allItemsSvg = `
    <svg width="36" height="26" viewBox="0 0 60 52" style="transform: translateY(-2px);">
      <!-- Mini Backpack -->
      <rect x="2" y="10" width="25" height="36" fill="#0284c7" rx="8" stroke="#075985" stroke-width="2"/>
      <!-- Mini Card -->
      <rect x="30" y="20" width="28" height="20" fill="#312e81" rx="3" stroke="#1e1b4b" stroke-width="2" style="transform: rotate(15deg);"/>
    </svg>
  `;

  // Render HTML structure
  viewport.innerHTML = `
    <div class="stage-livingroom" id="livingroom-bg">
      <!-- Dark overlay (lights off) -->
      <div id="dark-filter" class="dark-overlay"></div>

      <!-- Potted Plant (Decoration) -->
      <div style="position: absolute; bottom: 30px; left: 30px; width: 45px; height: 75px; z-index: 2;">
        <svg width="45" height="75" viewBox="0 0 45 75">
          <rect x="12" y="50" width="21" height="25" fill="#b45309" rx="3" stroke="#78350f" stroke-width="1.5"/>
          <path d="M22 50 C5 35 15 15 20 5 C25 15 35 35 22 50 Z" fill="#15803d" stroke="#166534" stroke-width="1"/>
          <path d="M22 50 C30 40 38 30 35 15 C28 20 25 35 22 50 Z" fill="#22c55e" stroke="#166534" stroke-width="1"/>
          <path d="M22 50 C12 40 4 30 7 15 C14 20 18 35 22 50 Z" fill="#22c55e" stroke="#166534" stroke-width="1"/>
        </svg>
      </div>

      <!-- Cozy Rug under Sofa -->
      <div style="position: absolute; bottom: 10px; left: 90px; width: 340px; height: 35px; background: rgba(99,102,241,0.15); border-radius: 50%; border: 1.5px dashed rgba(99,102,241,0.4); z-index: 1;"></div>

      <!-- Window showing Morning Sun (Decoration) -->
      <div style="position: absolute; top: 30px; left: 160px; width: 90px; height: 60px; border: 3px solid #475569; background: linear-gradient(to bottom, #fbbf24, #f59e0b); border-radius: 4px; box-shadow: 0 0 15px rgba(245,158,11,0.3); opacity: 0.8; z-index: 1;">
        <svg width="100%" height="100%" viewBox="0 0 100 70">
          <circle cx="50" cy="70" r="25" fill="#fef08a" opacity="0.9"/>
          <line x1="50" y1="45" x2="50" y2="10" stroke="#fef08a" stroke-width="3" stroke-dasharray="4"/>
          <line x1="25" y1="55" x2="5" y2="35" stroke="#fef08a" stroke-width="3" stroke-dasharray="4"/>
          <line x1="75" y1="55" x2="95" y2="35" stroke="#fef08a" stroke-width="3" stroke-dasharray="4"/>
        </svg>
      </div>

      <!-- Kitchen Silhouette (Mother Cooking in Background) -->
      <div class="kitchen-bg" style="position: absolute; bottom: 30px; right: 180px; width: 100px; height: 160px; z-index: 1; opacity: 0.65; pointer-events: none;">
        <svg width="100" height="160" viewBox="0 0 100 160">
          <line x1="0" y1="0" x2="0" y2="160" stroke="#475569" stroke-width="2" stroke-dasharray="4"/>
          <rect x="10" y="90" width="80" height="70" fill="#475569" stroke="#334155" stroke-width="2"/>
          <rect x="20" y="100" width="25" height="40" fill="#334155" rx="2"/>
          <rect x="55" y="100" width="25" height="40" fill="#334155" rx="2"/>
          <rect x="25" y="82" width="50" height="8" fill="#1e293b"/>
          <path d="M40 82 Q45 74 50 82 Q55 74 60 82 Z" fill="#38bdf8" style="animation: heartbeat 0.4s infinite alternate;"/>
          <rect x="35" y="76" width="30" height="6" fill="#0f172a" rx="1"/>
          <line x1="65" y1="79" x2="85" y2="76" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
          <path d="M42 70 Q45 60 43 52 M52 70 Q55 60 53 52" stroke="white" stroke-width="1.5" fill="none" opacity="0.7" style="animation: ring 0.8s infinite alternate;"/>
          <circle cx="65" cy="30" r="12" fill="#334155"/>
          <circle cx="65" cy="35" r="10" fill="#fed7aa"/>
          <path d="M60 45 L72 45 L78 90 L55 90 Z" fill="#ec4899"/>
          <path d="M63 55 Q75 65 83 75" stroke="#fed7aa" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Light Switch Panel on Wall -->
      <div id="switch-panel" class="switch-panel">
        <div class="switch-panel-btn"></div>
        <div class="switch-panel-btn"></div>
        <div class="switch-panel-btn"></div>
      </div>

      <!-- Floor division line -->
      <div class="room-floor" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 30px; background: #cbd5e1; border-top: 3px solid #94a3b8; z-index: 0;"></div>

      <!-- Standing Protagonist (Dressed in school uniform, unified single SVG to prevent floating limbs) -->
      <!-- z-index: 4 puts it below the dark filter overlay (z-index: 5) so it becomes pitch dark before lights turn on! -->
      <div id="hero" class="character-avatar" style="position: absolute; bottom: 30px; left: 80px; z-index: 4; width: 60px; height: 150px; display: flex; flex-direction: column; align-items: center;">
        <svg width="60" height="150" viewBox="0 0 60 150">
          <!-- Suit Arms -->
          <rect x="2" y="55" width="10" height="45" fill="#1e3a8a" rx="5"/>
          <circle cx="7" cy="100" r="5" fill="#fed7aa"/>
          <rect x="48" y="55" width="10" height="45" fill="#1e3a8a" rx="5"/>
          <circle cx="53" cy="100" r="5" fill="#fed7aa"/>

          <!-- Suit Legs -->
          <rect x="15" y="95" width="12" height="45" fill="#475569" rx="2"/>
          <rect x="13" y="140" width="16" height="8" fill="#1e293b" rx="3"/>
          <rect x="33" y="95" width="12" height="45" fill="#475569" rx="2"/>
          <rect x="31" y="140" width="16" height="8" fill="#1e293b" rx="3"/>

          <!-- Body Uniform -->
          <rect x="10" y="50" width="40" height="50" fill="#1e3a8a" rx="6" stroke="#172554" stroke-width="1.5"/>
          <path d="M20 50 L30 65 L40 50" fill="#fed7aa"/>
          <path d="M22 50 L25 60 L30 65 L35 60 L38 50" stroke="white" stroke-width="2" fill="none"/>
          <path d="M28 65 L32 65 L33 80 L30 85 L27 80 Z" fill="#f43f5e"/>

          <!-- Head -->
          <circle cx="30" cy="25" r="22" fill="#fed7aa" stroke="#f97316" stroke-width="1.5"/>
          <circle cx="21" cy="22" r="3.5" fill="white" stroke="black" stroke-width="1"/>
          <circle cx="21" cy="22" r="1.5" fill="black"/>
          <circle cx="39" cy="22" r="3.5" fill="white" stroke="black" stroke-width="1"/>
          <circle cx="39" cy="22" r="1.5" fill="black"/>
          <ellipse cx="30" cy="35" rx="5" ry="7" fill="#7f1d1d"/>
        </svg>
      </div>

      <!-- Sofa Container -->
      <div id="sofa-box" class="sofa-container" style="cursor: pointer;">
        <!-- Sofa SVG -->
        <svg width="320" height="130" viewBox="0 0 340 130">
          <rect x="10" y="20" width="320" height="70" fill="#1e3a8a" rx="15" stroke="#172554" stroke-width="3"/>
          <line x1="170" y1="20" x2="170" y2="90" stroke="#172554" stroke-width="2"/>
          <rect x="0" y="40" width="30" height="80" fill="#1e40af" rx="8" stroke="#172554" stroke-width="3"/>
          <rect x="310" y="40" width="30" height="80" fill="#1e40af" rx="8" stroke="#172554" stroke-width="3"/>
          <rect x="25" y="70" width="290" height="40" fill="#2563eb" rx="10" stroke="#172554" stroke-width="3"/>
          <line x1="170" y1="70" x2="170" y2="110" stroke="#172554" stroke-width="2"/>
          <rect x="40" y="110" width="12" height="15" fill="#451a03" rx="2"/>
          <rect x="288" y="110" width="12" height="15" fill="#451a03" rx="2"/>
        </svg>
      </div>

      <!-- Backpack item (Sibling of sofa, z-index 11, sitting on the cushion correctly at bottom: 62px) -->
      <!-- top: auto !important overrides absolute top set in screens.css to prevent it from floating high -->
      <div id="backpack" class="backpack-item" style="display: none; position: absolute; top: auto !important; bottom: 62px; left: 190px; z-index: 11;">
        <svg width="45" height="52" viewBox="0 0 45 52">
          <rect x="5" y="10" width="35" height="40" fill="#0284c7" rx="10" stroke="#075985" stroke-width="2.5"/>
          <path d="M15 10 Q22.5 2 30 10" stroke="#075985" stroke-width="3" fill="none" stroke-linecap="round"/>
          <rect x="10" y="26" width="25" height="20" fill="#0ea5e9" rx="5" stroke="#075985" stroke-width="2"/>
          <rect x="12" y="22" width="21" height="4" fill="#cbd5e1" rx="1"/>
        </svg>
      </div>

      <!-- Look Behind Sofa trigger button -->
      <button id="btn-behind-sofa" class="ending-btn" style="position: absolute; bottom: 15px; left: 240px; padding: 4px 10px; font-size:11px; z-index:10; display:none; border: 1.5px solid var(--color-warning);">🔍 소파 뒤 보기</button>

      <!-- Exit Door to Entrance -->
      <div id="livingroom-door" class="livingroom-door">
        <div class="door-handle"></div>
      </div>

      <!-- Modal selector for switches (5 Choices - Numbers with hints) -->
      <div id="switch-modal" class="switch-modal" style="display: none; width: 330px;">
        <div class="switch-modal-title">스위치를 선택하세요</div>
        <button class="switch-modal-btn" id="btn-ac">버튼 1 <span style="font-size:10px; color:var(--color-text-muted); font-weight:normal;">(이걸 누르면 추워질 것 같다!)</span></button>
        <button class="switch-modal-btn" id="btn-boiler">버튼 2 <span style="font-size:10px; color:var(--color-text-muted); font-weight:normal;">(더워질 것 같은 느낌이 난다...)</span></button>
        <button class="switch-modal-btn" id="btn-tv">버튼 3 <span style="font-size:10px; color:var(--color-text-muted); font-weight:normal;">(우렁찬 음악 소리가 들릴 것 같다!)</span></button>
        <button class="switch-modal-btn" id="btn-robot">버튼 4 <span style="font-size:10px; color:var(--color-text-muted); font-weight:normal;">(저절로 굴러다닐 것 같은 예감...)</span></button>
        <button class="switch-modal-btn" id="btn-lights">버튼 5 <span style="font-size:10px; color:var(--color-success); font-weight:bold;">(이거 딱 좋은데? 촉이 온다!)</span></button>
      </div>

      <!-- Sofa Behind Sweeping Mini-Game Panel -->
      <div id="behind-sofa-view" class="freeze-overlay" style="display: none; background: rgba(15, 23, 42, 0.96); z-index: 200;">
        <div style="text-align: center; color: white; margin-bottom: 15px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-warning);">🧹 소파 뒷공간 수색 (먼지가 가득합니다!)</h3>
          <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">먼지 뭉치를 마우스로 찔러 치우고 지갑을 찾으세요!</p>
        </div>
        
        <div id="dust-field" style="position: relative; width: 400px; height: 220px; background: #1e293b; border: 3px solid #475569; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 20px black;">
          <!-- Floor line -->
          <line x1="0" y1="180" x2="400" y2="180" stroke="#0f172a" stroke-width="4"/>
          
          <!-- Hidden Wallet (glowing SVG) -->
          <div id="hidden-wallet" style="position: absolute; top: 110px; left: 180px; cursor: pointer; display: block; z-index: 10;">
            <svg width="45" height="32" viewBox="0 0 35 25">
              <rect width="35" height="25" fill="#312e81" rx="3" stroke="#1e1b4b" stroke-width="2"/>
              <rect x="4" y="8" width="7" height="6" fill="gold" rx="1"/>
              <line x1="0" y1="4" x2="35" y2="4" stroke="#4f46e5" stroke-width="2"/>
            </svg>
          </div>
          
          <!-- 5 Dust Bunnies covering the space -->
          <div class="dust-bunny" id="dust-1" style="position: absolute; top: 95px; left: 160px; width: 85px; height: 60px; cursor: pointer; z-index: 20;">
            <svg width="100%" height="100%" viewBox="0 0 85 60"><ellipse cx="42" cy="30" rx="40" ry="28" fill="#64748b" opacity="0.9" style="filter: blur(4px);"/></svg>
          </div>
          <div class="dust-bunny" id="dust-2" style="position: absolute; top: 30px; left: 60px; width: 70px; height: 50px; cursor: pointer; z-index: 20;">
            <svg width="100%" height="100%" viewBox="0 0 70 50"><ellipse cx="35" cy="25" rx="32" ry="22" fill="#475569" opacity="0.85" style="filter: blur(4px);"/></svg>
          </div>
          <div class="dust-bunny" id="dust-3" style="position: absolute; top: 120px; left: 50px; width: 90px; height: 65px; cursor: pointer; z-index: 20;">
            <svg width="100%" height="100%" viewBox="0 0 90 65"><ellipse cx="45" cy="32" rx="42" ry="30" fill="#64748b" opacity="0.9" style="filter: blur(4px);"/></svg>
          </div>
          <div class="dust-bunny" id="dust-4" style="position: absolute; top: 40px; left: 240px; width: 80px; height: 55px; cursor: pointer; z-index: 20;">
            <svg width="100%" height="100%" viewBox="0 0 80 55"><ellipse cx="40" cy="27" rx="37" ry="25" fill="#475569" opacity="0.85" style="filter: blur(4px);"/></svg>
          </div>
          <div class="dust-bunny" id="dust-5" style="position: absolute; top: 110px; left: 270px; width: 95px; height: 70px; cursor: pointer; z-index: 20;">
            <svg width="100%" height="100%" viewBox="0 0 95 70"><ellipse cx="47" cy="35" rx="45" ry="32" fill="#64748b" opacity="0.9" style="filter: blur(4px);"/></svg>
          </div>
        </div>
        
        <button id="btn-close-behind" class="ending-btn secondary" style="margin-top: 15px; padding: 8px 24px;">돌아가기</button>
      </div>
    </div>
  `;

  // Set initial dialog
  gameEngine.setDialogue("주인공", "거실로 나왔는데 너무 어둡네... 벽면에 있는 스위치를 눌러 불부터 켜자!");

  const bgEl = document.getElementById('livingroom-bg');
  const darkFilterEl = document.getElementById('dark-filter');
  const switchPanelEl = document.getElementById('switch-panel');
  const switchModalEl = document.getElementById('switch-modal');
  
  const btnAc = document.getElementById('btn-ac');
  const btnBoiler = document.getElementById('btn-boiler');
  const btnTv = document.getElementById('btn-tv');
  const btnRobot = document.getElementById('btn-robot');
  const btnLights = document.getElementById('btn-lights');
  
  const sofaBoxEl = document.getElementById('sofa-box');
  const backpackEl = document.getElementById('backpack');
  const btnBehindSofa = document.getElementById('btn-behind-sofa');
  const exitDoorEl = document.getElementById('livingroom-door');

  // Sweeping Mini-Game Elements
  const behindSofaView = document.getElementById('behind-sofa-view');
  const btnCloseBehind = document.getElementById('btn-close-behind');
  const hiddenWallet = document.getElementById('hidden-wallet');
  const dustBunnies = document.querySelectorAll('.dust-bunny');

  // Handle Toe Stub click in the dark
  bgEl.addEventListener('mousedown', (e) => {
    if (isLightOn) return;
    if (activeModal) return;
    if (e.target.id === 'switch-panel' || e.target.classList.contains('switch-panel-btn') || e.target.closest('.switch-panel')) return;

    // Trigger toe stub
    audio.playThud();
    gameEngine.subtractTime(10);
    gameEngine.flashScreenDamage();
    
    // Pain text popup
    const textOpts = ["쿵!", "쾅!", "앗!", "아야!", "꽈당!"];
    const randomText = textOpts[Math.floor(Math.random() * textOpts.length)];
    
    const painText = document.createElement('span');
    painText.className = 'toe-pain-text';
    painText.innerText = randomText;
    
    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    painText.style.left = `${x - 15}px`;
    painText.style.top = `${y - 15}px`;
    
    viewport.appendChild(painText);
    setTimeout(() => painText.remove(), 800);

    const dialogOpts = [
      "아앗! 테이블 모서리에 새끼발가락을 찧었다!! (10초 차감)",
      "우당탕! 문지방에 발이 걸렸다! 으악 아파라... (10초 차감)",
      "쾅! 어둠 속에서 벽에 부딪쳐 정신이 혼미하다! (10초 차감)"
    ];
    gameEngine.setDialogue("주인공", dialogOpts[Math.floor(Math.random() * dialogOpts.length)]);
  });

  // Switch Panel Click
  switchPanelEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeModal) return;
    
    audio.playClick();
    activeModal = true;
    switchModalEl.style.display = 'flex';
  });

  // Switch: Button 1 (AC)
  btnAc.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    audio.playAirConditionerSong();
    gameEngine.subtractTime(5);
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('ice', 2000);
    gameEngine.setDialogue("주인공", "딩동댕~ 버튼 1을 누르자 시원한 바람이 쌩쌩 나온다. 조명 스위치가 아니야! (5초 차감)");
    closeModal();
  });

  // Switch: Button 2 (Boiler)
  btnBoiler.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    audio.playBoilerRumble();
    gameEngine.subtractTime(5);
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('heat', 2000);
    gameEngine.setDialogue("주인공", "웅웅~ 버튼 2를 누르자 보일러 온수가 가동된다! 발바닥이 뜨겁다... (5초 차감)");
    closeModal();
  });

  // Switch: Button 3 (Smart TV)
  btnTv.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    audio.playAirConditionerSong();
    gameEngine.subtractTime(8);
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('tv', 2500);
    gameEngine.setDialogue("주인공", "버튼 3을 누르자 TV가 켜지며 신나는 애니메이션 로고송이 나온다! 어서 꺼야 해! (8초 차감)");
    closeModal();
  });

  // Switch: Button 4 (Robot Vacuum)
  btnRobot.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    audio.playBoilerRumble();
    gameEngine.subtractTime(8);
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('vacuum', 2000);
    gameEngine.setDialogue("주인공", "버튼 4를 누르자 로봇 청소기가 튀어나와 내 발목에 부딪쳤다! (8초 차감)");
    closeModal();
  });

  // Switch: Button 5 (Lights - 정답)
  btnLights.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playClick();
    
    isLightOn = true;
    darkFilterEl.classList.add('turned-on');
    switchPanelEl.querySelectorAll('.switch-panel-btn').forEach(btn => btn.classList.add('active'));
    
    gameEngine.setDialogue("주인공", "번쩍! 오케이, 드디어 불이 켜졌다! 소파를 조사하고 소지품들을 챙기자.");
    closeModal();
  });

  function closeModal() {
    activeModal = false;
    switchModalEl.style.display = 'none';
  }

  // 1. Sofa Cushion Search (Reveal backpack)
  sofaBoxEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isLightOn || hasBackpack || backpackEl.style.display === 'block') return;

    audio.playClick();
    backpackEl.style.display = 'block';
    gameEngine.setDialogue("주인공", "소파 쿠션 깊숙한 곳에서 가방의 어깨끈이 보인다! 가방을 클릭해서 챙기자.");
  });

  // Backpack Click (Pick up backpack and make it disappear)
  backpackEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hasBackpack) return;

    audio.playClick();
    hasBackpack = true;
    backpackEl.style.display = 'none';

    // Add backpack to inventory
    gameEngine.addToInventory('backpack', backpackSvg);
    gameEngine.setDialogue("주인공", "소파에서 가방을 챙겼다! 교통카드 지갑은 어디 갔지? 소파 뒤에 떨어졌나?");

    // Show Look Behind Sofa button
    btnBehindSofa.style.display = 'block';
    checkBothItems();
  });

  // 2. Open Sofa Behind View (Sweeping game)
  btnBehindSofa.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playClick();
    behindSofaView.style.display = 'flex';
    gameEngine.setDialogue("주인공", "으아, 소파 뒤에 먼지가 엄청나네... 지갑을 찾아보자.");
  });

  // Dust click handles
  dustBunnies.forEach(dust => {
    dust.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playTick(true); // dust clearing sweep tick
      dust.style.display = 'none';
    });
  });

  // Wallet pick
  hiddenWallet.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hasWallet) return;

    audio.playClick();
    hasWallet = true;
    hiddenWallet.style.display = 'none';
    behindSofaView.style.display = 'none';
    btnBehindSofa.style.display = 'none';

    gameEngine.addToInventory('wallet', walletSvg);
    gameEngine.setDialogue("주인공", "심봤다! 소파 뒤 먼지 구덩이에서 교통카드 지갑을 찾았다! 천만다행이야.");
    checkBothItems();
  });

  // Close Sofa Behind View
  btnCloseBehind.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playClick();
    behindSofaView.style.display = 'none';
    gameEngine.setDialogue("주인공", "거실로 돌아왔다. 아직 지갑을 못 찾았다면 다시 소파 뒤를 확인해야 해.");
  });

  function checkBothItems() {
    if (hasBackpack && hasWallet) {
      gameEngine.removeFromInventory('backpack');
      gameEngine.removeFromInventory('wallet');
      gameEngine.addToInventory('all_items', allItemsSvg);
      
      showOkEffect("준비물 체크 OK!!", () => {
        gameEngine.setDialogue("주인공", "준비 완료! 빨리 현관문을 열고 최종 관문으로 진입하자!");
      });
    }
  }

  // Exit Door Click
  exitDoorEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isLightOn) return;

    if (hasBackpack && hasWallet) {
      audio.playClick();
      gameEngine.nextStage();
    } else {
      audio.playBuzzer();
      gameEngine.setDialogue("주인공", "가방이나 교통카드를 하나라도 두고 가면 버스를 탈 수 없어! 모두 찾고 탈출하자.");
    }
  });
}
