import { audio } from '../audio.js';
import { showOkEffect } from '../components/ok-effect.js';

export function loadStage1(gameEngine) {
  const viewport = document.getElementById('stage-viewport');
  
  // Set stage title
  gameEngine.updateStageTitle("1단계: 내 방", "교복 확보하기");
  
  // Reset inventory & states
  gameEngine.clearInventory();
  let hasKey = false;
  let blanketMoved = false;
  let closetOpen = false;
  let uniformDressed = false;
  let activeClothesModal = false;

  // Custom key SVG string for inventory
  const keySvg = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="gold">
      <path d="M7 18c-2.76 0-5-2.24-5-5s2.24-5 5-5c2.25 0 4.13 1.48 4.74 3.5H16v2h2v-2h2v2h2v2H11.74C11.13 16.52 9.25 18 7 18zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  `;

  // Render HTML structure (Beautiful CSS-based SVG layouts instead of emojis)
  viewport.innerHTML = `
    <div class="stage-bedroom">
      <!-- Floor division line -->
      <div class="room-floor" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 30px; background: #cbd5e1; border-top: 3px solid #94a3b8; z-index: 0;"></div>

      <!-- Bright Morning Room Window SVG (Decoration) -->
      <div class="room-window" style="position: absolute; top: 30px; left: 160px; width: 90px; height: 65px; border: 3.5px solid #854d0e; background: linear-gradient(to bottom, #38bdf8, #bae6fd); border-radius: 4px; z-index: 1; box-shadow: 0 0 15px rgba(56,189,248,0.4);">
        <svg width="100%" height="100%" viewBox="0 0 90 65">
          <circle cx="45" cy="40" r="22" fill="#fbbf24" opacity="0.9"/>
          <circle cx="45" cy="40" r="15" fill="#f59e0b" opacity="0.95"/>
          <ellipse cx="20" cy="50" rx="15" ry="6" fill="white" opacity="0.8"/>
          <ellipse cx="75" cy="45" rx="18" ry="7" fill="white" opacity="0.8"/>
          <line x1="45" y1="0" x2="45" y2="65" stroke="#854d0e" stroke-width="3"/>
          <line x1="0" y1="32" x2="90" y2="32" stroke="#854d0e" stroke-width="3"/>
        </svg>
      </div>
      <!-- Dressing Table (화장대 서랍 수색용) -->
      <div id="dressing-table" class="dressing-table-container">
        <svg width="70" height="110" viewBox="0 0 80 120" style="cursor: pointer;">
          <!-- Mirror Frame -->
          <ellipse cx="40" cy="45" rx="23" ry="28" fill="#e2e8f0" stroke="#475569" stroke-width="4"/>
          <!-- Mirror Glass -->
          <ellipse cx="40" cy="45" rx="19" ry="24" fill="#a5f3fc" />
          <path d="M28 35 L48 55" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
          <!-- Table Board -->
          <rect x="5" y="80" width="70" height="12" fill="#7c2d12" rx="3" stroke="#451a03" stroke-width="2"/>
          <!-- Drawer handles -->
          <circle cx="25" cy="86" r="3" fill="gold"/>
          <circle cx="55" cy="86" r="3" fill="gold"/>
          <!-- Legs -->
          <rect x="12" y="92" width="8" height="28" fill="#451a03" />
          <rect x="60" y="92" width="8" height="28" fill="#451a03" />
        </svg>
      </div>

      <!-- Locked Closet (Rich interior SVG layout instead of singular uniform) -->
      <div id="closet" class="closet-container">
        <div class="closet-body">
          <div class="closet-door-left"><div class="closet-handle"></div></div>
          <div class="closet-door-right"><div class="closet-handle"></div></div>
          
          <!-- Closet Rich Interior (Hangers, Clothes, Shoe boxes, Shoes, Target Uniform) -->
          <div id="closet-interior" style="display: none; position: absolute; inset: 0; padding: 0px; border-radius: 4px; overflow: hidden; z-index: 1;">
            <svg width="100%" height="100%" viewBox="0 0 160 220" style="display: block;">
              <!-- Wood background interior -->
              <rect width="160" height="220" fill="#3b1d03"/>
              
              <!-- Shelves lines -->
              <line x1="0" y1="45" x2="160" y2="45" stroke="#1c0d02" stroke-width="3"/>
              <line x1="0" y1="180" x2="160" y2="180" stroke="#1c0d02" stroke-width="3"/>
              
              <!-- Top shelf items (Folded jeans & hat) -->
              <rect x="15" y="25" width="30" height="16" fill="#1e3a8a" rx="2" stroke="#172554" stroke-width="1"/>
              <rect x="15" y="18" width="30" height="10" fill="#2563eb" rx="2" stroke="#1d4ed8" stroke-width="1"/>
              <ellipse cx="85" cy="35" rx="16" ry="3" fill="#ea580c"/>
              <path d="M73 35 L97 35 L92 22 L78 22 Z" fill="#ea580c"/>
              
              <!-- Hanging rod -->
              <line x1="10" y1="58" x2="150" y2="58" stroke="silver" stroke-width="2"/>
              
              <!-- Other clothes hanging (decorative) -->
              <!-- Red dress -->
              <path d="M22 68 Q28 64 34 68 L38 120 L18 120 Z" fill="#b91c1c"/>
              <line x1="28" y1="58" x2="28" y2="67" stroke="silver" stroke-width="1"/>
              <!-- Green jacket -->
              <path d="M110 68 Q118 64 126 68 L130 115 L106 115 Z" fill="#15803d"/>
              <line x1="118" y1="58" x2="118" y2="67" stroke="silver" stroke-width="1"/>
              
              <!-- Target School Uniform (Clickable - has ID uniform-item) -->
              <g id="uniform-item" style="cursor: pointer;">
                <!-- Hanger hook -->
                <line x1="72" y1="58" x2="72" y2="68" stroke="silver" stroke-width="1.5"/>
                <!-- Uniform blazer -->
                <path d="M52 70 Q72 63 92 70 L96 140 L48 140 Z" fill="#1e3a8a" stroke="#172554" stroke-width="1.5"/>
                <!-- Collar white -->
                <path d="M64 70 L72 82 L80 70" stroke="white" stroke-width="2.5" fill="none"/>
                <!-- Red tie -->
                <path d="M70 70 L74 70 L75 95 L72 100 L69 95 Z" fill="#f43f5e"/>
                <circle cx="85" cy="85" r="2.5" fill="gold"/>
              </g>
              
              <!-- Bottom Shelf Items (Shoe box and shoes) -->
              <!-- Shoe boxes -->
              <rect x="15" y="188" width="35" height="20" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
              <rect x="20" y="196" width="10" height="4" fill="#64748b" rx="1"/>
              <!-- Running shoes -->
              <path d="M72 208 Q82 196 92 208 Z" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
              <rect x="77" y="206" width="10" height="4" fill="white" rx="1"/>
              <!-- Boots -->
              <path d="M110 208 Q118 190 125 198 L132 208 Z" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Standing Protagonist (Hidden initially while sleeping, unified single SVG to prevent floating limbs) -->
      <div id="hero" class="character-avatar" style="display: none; position: absolute; bottom: 30px; left: 310px; z-index: 2; width: 60px; height: 150px;">
        <div id="hero-svg-container" style="width: 100%; height: 100%;">
          <!-- Undressed (Underwear singlet/boxers) SVG representation -->
          <svg width="60" height="150" viewBox="0 0 60 150">
            <!-- Skin Arms -->
            <rect x="2" y="55" width="10" height="45" fill="#fed7aa" rx="5"/>
            <rect x="48" y="55" width="10" height="45" fill="#fed7aa" rx="5"/>
            <!-- Skin Legs -->
            <rect x="15" y="95" width="12" height="45" fill="#fed7aa" rx="2"/>
            <rect x="33" y="95" width="12" height="45" fill="#fed7aa" rx="2"/>
            <rect x="13" y="140" width="16" height="8" fill="#a8a29e" rx="3"/>
            <rect x="31" y="140" width="16" height="8" fill="#a8a29e" rx="3"/>
            
            <!-- Torso bare skin -->
            <rect x="10" y="50" width="40" height="45" fill="#fed7aa" rx="4"/>
            <!-- Blue boxers -->
            <rect x="8" y="85" width="44" height="20" fill="#3b82f6" rx="2"/>
            <rect x="25" y="85" width="10" height="20" fill="#1d4ed8"/>

            <!-- Head -->
            <circle cx="30" cy="25" r="22" fill="#fed7aa" stroke="#f97316" stroke-width="1.5"/>
            <!-- Eyes (shocked) -->
            <circle cx="21" cy="22" r="3.5" fill="white" stroke="black" stroke-width="1"/>
            <circle cx="21" cy="22" r="1.5" fill="black"/>
            <circle cx="39" cy="22" r="3.5" fill="white" stroke="black" stroke-width="1"/>
            <circle cx="39" cy="22" r="1.5" fill="black"/>
            <ellipse cx="30" cy="35" rx="5" ry="7" fill="#7f1d1d"/>
          </svg>
        </div>
      </div>

      <!-- Bed -->
      <div id="bed" class="bed-container">
        <div style="position: absolute; top: -15px; left: 0; width: 25px; height: 110px; background: #5c300c; border-radius: 4px;"></div>
        <div class="bed-frame"></div>
        <div class="bed-mattress">
          <!-- Pillow (Clickable search target) -->
          <div id="bed-pillow" class="pillow-target" style="position: absolute; top: 12px; left: 15px; width: 45px; height: 32px; background: white; border-radius: 8px; border: 2px solid #cbd5e1; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
            <ellipse cx="22" cy="16" rx="12" ry="6" fill="#e2e8f0"/>
          </div>

          <!-- Sleeping Hero Lying Down (Will be hidden on Wake Up) -->
          <div id="sleeping-hero" class="sleeping-hero-style" style="position: absolute; top: 15px; left: 65px; display: flex; align-items: center; gap: 8px;">
            <svg width="34" height="34" viewBox="0 0 34 34" style="transform: rotate(90deg);">
              <circle cx="17" cy="17" r="15" fill="#fed7aa" stroke="#d97706" stroke-width="1.5"/>
              <path d="M8 15 Q11 18 13 15" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
              <path d="M21 15 Q23 18 26 15" stroke="black" stroke-width="2" fill="none" stroke-linecap="round"/>
              <circle cx="17" cy="22" r="2" fill="black"/>
            </svg>
            <span class="zzz-bubble animate-zzz" style="font-family: var(--font-sans); font-weight: bold; color: #a5b4fc; font-size: 14px; text-shadow: 0 0 4px rgba(99,102,241,0.5);">zZZ...</span>
          </div>
        </div>

        <!-- Messy blanket covering the rest of the bed & key -->
        <div id="blanket" class="blanket-messy">
          <svg width="100%" height="100%" viewBox="0 0 150 90" preserveAspectRatio="none">
            <rect width="150" height="90" fill="#f8fafc" rx="10" stroke="#cbd5e1" stroke-width="2"/>
            <path d="M20 20 L130 70 M20 70 L130 20" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4"/>
          </svg>
        </div>

        <!-- Hidden Key under blanket -->
        <div id="room-key" class="key-hidden" style="display: none; position: absolute; bottom: 40px; right: 70px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="gold" style="filter: drop-shadow(0 2px 4px black);">
            <path d="M7 18c-2.76 0-5-2.24-5-5s2.24-5 5-5c2.25 0 4.13 1.48 4.74 3.5H16v2h2v-2h2v2h2v2H11.74C11.13 16.52 9.25 18 7 18zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </div>
      </div>

      <!-- Room Exit Door -->
      <div id="exit-door" class="room-door">
        <div class="door-handle"></div>
      </div>

      <!-- Wardrobe clothing selection modal -->
      <div id="clothes-modal" class="switch-modal" style="display: none; width: 300px;">
        <div class="switch-modal-title">입을 옷을 고르세요</div>
        <button class="switch-modal-btn" id="btn-pj">💤 보들보들 수면 잠옷</button>
        <button class="switch-modal-btn" id="btn-space">🚀 번쩍번쩍 우주복 코스튬</button>
        <button class="switch-modal-btn" id="btn-uniform">👔 단정한 교복 세트</button>
      </div>
    </div>
  `;

  // Start with alarm ringing
  const alarm = audio.playAlarm();
  gameEngine.setDialogue("알람 시계", "따르릉!!! 따르릉!!! (화면을 클릭해 얼른 기상하자!)");
  
  // Elements
  const sleepingHero = document.getElementById('sleeping-hero');
  const heroEl = document.getElementById('hero');
  const pillowEl = document.getElementById('bed-pillow');
  const dresserEl = document.getElementById('dressing-table');
  const blanketEl = document.getElementById('blanket');
  const keyEl = document.getElementById('room-key');
  const closetEl = document.getElementById('closet');
  const closetInterior = document.getElementById('closet-interior');
  const uniformEl = document.getElementById('uniform-item');
  const exitDoorEl = document.getElementById('exit-door');



  const clothesModal = document.getElementById('clothes-modal');
  const btnPj = document.getElementById('btn-pj');
  const btnSpace = document.getElementById('btn-space');
  const btnUniform = document.getElementById('btn-uniform');

  // 1. Wake Up Listener (Using Capturing to consume the first click cleanly)
  let isWokenUp = false;
  const wakeUpHandler = (e) => {
    if (isWokenUp) return;
    isWokenUp = true;
    e.stopPropagation(); // Prevent the click from registering on elements underneath!
    
    viewport.removeEventListener('click', wakeUpHandler, true);
    
    // Stop alarm and BGM
    if (alarm) alarm.stop();
    audio.playClick();
    audio.startBgm('fast');
    
    // UI Swap
    sleepingHero.style.display = 'none';
    heroEl.style.display = 'flex';
    
    // Start game timer
    gameEngine.startTimer();
    gameEngine.setDialogue("주인공", "으아악! 벌써 8시 10분이야?! 5분 뒤면 등교 버스 출발이라고! 빨리 준비하자!");
  };
  viewport.addEventListener('click', wakeUpHandler, true);

  // 2. Pillow Click
  pillowEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isWokenUp) return;
    audio.playClick();
    gameEngine.setDialogue("주인공", "베개 밑에는 아무것도 없네... 먼지만 쿨럭쿨럭 날린다.");
  });

  // 3. Dressing Table Click
  dresserEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isWokenUp) return;
    audio.playClick();
    gameEngine.setDialogue("주인공", "화장대 서랍을 열어보았다! 스킨로션과 먼지투성이 빗 말고는 없다.");
  });

  // 4. Blanket Click (Reveal key)
  blanketEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isWokenUp) return;
    if (blanketMoved) return;
    
    audio.playClick();
    blanketMoved = true;
    blanketEl.classList.add('removed');
    
    setTimeout(() => {
      keyEl.style.display = 'flex';
      gameEngine.setDialogue("주인공", "좋아! 이불을 걷어찼더니 아래에 장롱 열쇠가 떨어져 있었어!");
    }, 300);
  });

  // 5. Key Click
  keyEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hasKey) return;
    
    audio.playClick();
    hasKey = true;
    keyEl.style.display = 'none';
    gameEngine.addToInventory('key', keySvg);
    gameEngine.setDialogue("주인공", "장롱 열쇠 획득! 이걸로 얼른 옷장을 열자.");
  });

  // 6. Closet Click
  closetEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isWokenUp) return;
    
    if (uniformDressed) {
      gameEngine.setDialogue("주인공", "옷도 다 입었으니 이제 현관으로 나가자!");
      return;
    }

    if (closetOpen) {
      // Trigger selection modal
      openClothesModal();
      return;
    }

    if (gameEngine.hasItem('key')) {
      audio.playUnlock();
      closetOpen = true;
      closetEl.classList.add('open');
      gameEngine.removeFromInventory('key');
      
      // Reveal closet interior graphics
      setTimeout(() => {
        closetInterior.style.display = 'block';
        gameEngine.setDialogue("주인공", "장롱 문이 열렸다! 안에 예비 옷들이랑 신발도 많네. 교복을 찾아 클릭하자.");
        
        // Re-bind uniform-item click since it's dynamically rendered inside closetInterior
        document.getElementById('uniform-item').addEventListener('click', (ev) => {
          ev.stopPropagation();
          openClothesModal();
        });
      }, 500);
    } else {
      audio.playBuzzer();
      closetEl.classList.add('shake-screen');
      setTimeout(() => closetEl.classList.remove('shake-screen'), 400);
      gameEngine.setDialogue("주인공", "앗, 장롱 문이 잠겨 있어... 열쇠를 찾아와야 한다.");
    }
  });

  function openClothesModal() {
    audio.playClick();
    activeClothesModal = true;
    clothesModal.style.display = 'flex';
  }

  function closeClothesModal() {
    activeClothesModal = false;
    clothesModal.style.display = 'none';
  }

  // Pajamas Option
  btnPj.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    gameEngine.subtractTime(5);
    gameEngine.flashScreenDamage();
    gameEngine.setDialogue("주인공", "이 수면 잠옷을 입고 학교에 갔다간 하루 종일 슈퍼스타(놀림감)가 될 거야! (5초 차감)");
    closeClothesModal();
  });

  // Space Suit Option
  btnSpace.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playBuzzer();
    gameEngine.subtractTime(5);
    gameEngine.flashScreenDamage();
    gameEngine.setDialogue("주인공", "우주복이라니! 이걸 입고 뛰었다간 땀띠 나고 버스 문 통과도 안 돼! (5초 차감)");
    closeClothesModal();
  });

  // Neat Uniform Option (정답)
  btnUniform.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playClick();
    
    uniformDressed = true;
    
    // Hide uniform inside SVG interior
    const uniformG = document.getElementById('uniform-item');
    if (uniformG) uniformG.style.display = 'none';
    
    // Swap skin to school uniform
    const svgContainer = document.getElementById('hero-svg-container');
    if (svgContainer) {
      svgContainer.innerHTML = `
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
      `;
    }

    showOkEffect("교복 장착 OK!!", () => {
      gameEngine.setDialogue("주인공", "교복을 완벽하게 입었어! 지체하지 말고 거실로 나가자!");
    });
    closeClothesModal();
  });

  // 8. Exit Door Click
  exitDoorEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isWokenUp) return;

    if (uniformDressed) {
      audio.playClick();
      gameEngine.nextStage();
    } else {
      audio.playBuzzer();
      gameEngine.setDialogue("주인공", "안 돼! 속옷 차림으로 바로 거실로 나갈 순 없어! 옷장(장롱)을 열어 옷을 입어야 해!");
    }
  });
}
