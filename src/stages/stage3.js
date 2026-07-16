import { audio } from '../audio.js';
import { showOkEffect } from '../components/ok-effect.js';

export function loadStage3(gameEngine) {
  const viewport = document.getElementById('stage-viewport');
  
  // Set stage title
  gameEngine.updateStageTitle("3단계: 현관 앞", "엄마의 아침 밥상 습격");

  let momMoved = false;

  // Render HTML structure (Beautiful CSS-based SVG layouts with rich foyer furniture)
  viewport.innerHTML = `
    <div class="stage-entrance">
      <!-- 1. Ceiling Sensor Light (Decoration) -->
      <div style="position: absolute; top: 0; right: 180px; width: 60px; height: 35px; z-index: 1; pointer-events: none;">
        <svg width="60" height="35" viewBox="0 0 60 35">
          <line x1="30" y1="0" x2="30" y2="12" stroke="silver" stroke-width="2"/>
          <path d="M15 12 L45 12 L38 25 L22 25 Z" fill="#475569" stroke="#334155" stroke-width="1.5"/>
          <circle cx="30" cy="25" r="8" fill="#fef08a" style="filter: drop-shadow(0 0 8px #fef08a);"/>
        </svg>
      </div>

      <!-- 2. Full-body Wall Mirror (Decoration) -->
      <div style="position: absolute; bottom: 30px; left: 320px; width: 60px; height: 160px; z-index: 1;">
        <svg width="60" height="160" viewBox="0 0 60 160">
          <rect width="60" height="160" fill="#78350f" rx="30" stroke="#451a03" stroke-width="3"/>
          <rect x="5" y="5" width="50" height="150" fill="#e0f7fa" rx="25"/>
          <path d="M15 30 L45 140" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
        </svg>
      </div>

      <!-- 3. Wall Hanger with Yellow Coat (Decoration) -->
      <div style="position: absolute; top: 50px; left: 290px; width: 60px; height: 80px; z-index: 1;">
        <svg width="60" height="80" viewBox="0 0 60 80">
          <rect x="0" y="10" width="60" height="8" fill="#a16207" rx="2"/>
          <circle cx="15" cy="14" r="3" fill="#451a03"/>
          <circle cx="45" cy="14" r="3" fill="#451a03"/>
          <path d="M35 20 Q45 15 55 20 L58 70 L32 70 Z" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
          <line x1="45" y1="14" x2="45" y2="22" stroke="silver" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- 4. Tall Shoe Cabinet / Hanger (Decoration) -->
      <div style="position: absolute; bottom: 30px; left: 395px; width: 110px; height: 190px; z-index: 1;">
        <svg width="110" height="190" viewBox="0 0 110 190">
          <rect width="110" height="190" fill="#5c2e0b" rx="4" stroke="#3d1d03" stroke-width="3"/>
          <line x1="55" y1="0" x2="55" y2="190" stroke="#3d1d03" stroke-width="2"/>
          <line x1="0" y1="35" x2="110" y2="35" stroke="#3d1d03" stroke-width="2.5"/>
          <rect x="20" y="15" width="15" height="4" fill="gold" rx="1"/>
          <rect x="75" y="15" width="15" height="4" fill="gold" rx="1"/>
          <rect x="42" y="90" width="4" height="24" fill="gold" rx="1"/>
          <rect x="64" y="90" width="4" height="24" fill="gold" rx="1"/>
          <rect x="40" y="-12" width="30" height="12" fill="#d97706" rx="2"/>
          <path d="M35 -12 Q55 -35 48 -12 M55 -12 Q65 -30 62 -12 M70 -12 Q75 -25 68 -12" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- 5. Entryway Floor Tiles & Scattered Shoes (Decoration) -->
      <div style="position: absolute; bottom: 30px; right: 40px; width: 150px; height: 25px; background: #e2e8f0; border-top: 2.5px solid #cbd5e1; z-index: 1; opacity: 0.95;">
        <svg width="100%" height="100%" viewBox="0 0 150 25">
          <!-- Slippers -->
          <ellipse cx="25" cy="12" rx="10" ry="4" fill="#94a3b8"/>
          <ellipse cx="38" cy="14" rx="10" ry="4" fill="#94a3b8"/>
          <!-- Sneaker -->
          <path d="M75 16 C85 10 95 10 100 16 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
          <path d="M112 18 C122 12 132 12 137 18 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
        </svg>
      </div>

      <!-- 6. Umbrella Stand with peaking umbrellas (Decoration) -->
      <div style="position: absolute; bottom: 30px; right: 10px; width: 35px; height: 70px; z-index: 2;">
        <svg width="35" height="70" viewBox="0 0 35 70">
          <rect x="3" y="30" width="29" height="40" fill="#94a3b8" rx="2" stroke="#64748b" stroke-width="1.5"/>
          <line x1="3" y1="42" x2="32" y2="42" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M10 30 Q10 10 18 10 Q24 10 24 18" stroke="#f43f5e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M22 30 Q22 15 28 15" stroke="#3b82f6" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Dining Choices Panel (5 Choices - NO HINTS) -->
      <div id="food-menu" class="food-choices-container">
        <div class="food-card" id="food-cheongguk">
          <div class="food-icon" id="icon-cheongguk"></div>
          <div class="food-info">
            <span class="food-name">뚝배기 청국장</span>
          </div>
        </div>
        
        <div class="food-card" id="food-apple">
          <div class="food-icon" id="icon-apple"></div>
          <div class="food-info">
            <span class="food-name">통사과와 과도</span>
          </div>
        </div>

        <div class="food-card" id="food-toast">
          <div class="food-icon" id="icon-toast"></div>
          <div class="food-info">
            <span class="food-name">잼 바른 토스트</span>
          </div>
        </div>

        <div class="food-card" id="food-ramen">
          <div class="food-icon" id="icon-ramen"></div>
          <div class="food-info">
            <span class="food-name">매운 불닭볶음면</span>
          </div>
        </div>

        <div class="food-card" id="food-potato">
          <div class="food-icon" id="icon-potato"></div>
          <div class="food-info">
            <span class="food-name">얼어붙은 아이스 고구마</span>
          </div>
        </div>
      </div>

      <!-- Mother Character SVG illustration -->
      <div id="mother" class="mother-character angry">
        <svg width="100" height="200" viewBox="0 0 100 200">
          <circle cx="50" cy="40" r="28" fill="#4b5563"/>
          <circle cx="50" cy="45" r="22" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
          <circle cx="42" cy="42" r="2.5" fill="black"/>
          <circle cx="58" cy="42" r="2.5" fill="black"/>
          <line id="mom-brow-l" x1="36" y1="34" x2="45" y2="38" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
          <line id="mom-brow-r" x1="64" y1="34" x2="55" y2="38" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
          <path id="mom-mouth" d="M43 55 Q50 48 57 55" stroke="black" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M28 35 Q50 20 72 35" fill="#4b5563"/>
          <circle cx="28" cy="45" r="8" fill="#4b5563"/>
          <circle cx="72" cy="45" r="8" fill="#4b5563"/>
          <path d="M25 67 L75 67 L85 180 L15 180 Z" fill="#db2777"/>
          <path d="M35 85 L65 85 L70 180 L30 180 Z" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
          <path d="M35 85 L50 67 L65 85" stroke="white" stroke-width="3.5" fill="none"/>
          <rect x="12" y="82" width="76" height="10" fill="#7c2d12" rx="3" stroke="#451a03" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- Front Door -->
      <div id="front-door" class="entrance-door">
        <span style="font-size: 24px; color: rgba(255,255,255,0.3);">🚪</span>
      </div>

      <!-- Freeze Screen Overlay for Apple Slicing (initially hidden) -->
      <div id="freeze-panel" class="freeze-overlay" style="display: none;">
        <svg width="100" height="100" viewBox="0 0 100 100" style="animation: vibrate-alarm 0.5s infinite;">
          <circle cx="50" cy="55" r="30" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
          <path d="M50 25 Q55 15 60 10" stroke="#15803d" stroke-width="4" fill="none"/>
          <line x1="15" y1="85" x2="85" y2="15" stroke="silver" stroke-width="8" stroke-linecap="round" style="filter: drop-shadow(0 2px 4px black);"/>
          <line x1="5" y1="95" x2="25" y2="75" stroke="#475569" stroke-width="12" stroke-linecap="round"/>
        </svg>
        <span style="font-weight: 700; font-size: 16px; color: var(--color-warning);">엄마가 정성껏 사과를 깎는 중...</span>
        <div class="progress-bar-container">
          <div id="progress-fill" class="progress-bar-fill"></div>
        </div>
      </div>
    </div>
  `;

  // Draw the SVG icons inside the food cards
  document.getElementById('icon-cheongguk').innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path d="M15 10 Q17 5 15 2 M20 10 Q22 5 20 2 M25 10 Q27 5 25 2" stroke="orange" stroke-width="1.5" fill="none" opacity="0.8"/>
      <rect x="5" y="15" width="30" height="18" fill="#451a03" rx="5" stroke="#1c0d02" stroke-width="2"/>
      <ellipse cx="20" cy="15" rx="15" ry="4" fill="#a16207"/>
      <path d="M28 12 L35 7" stroke="silver" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;

  document.getElementById('icon-apple').innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="22" r="13" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
      <path d="M20 9 Q23 4 25 2" stroke="#15803d" stroke-width="2.5" fill="none"/>
      <path d="M8 32 L20 20" stroke="silver" stroke-width="3" stroke-linecap="round"/>
      <path d="M5 35 L8 32" stroke="#475569" stroke-width="4.5" stroke-linecap="round"/>
    </svg>
  `;

  document.getElementById('icon-toast').innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <rect x="8" y="12" width="24" height="24" fill="#fed7aa" rx="4" stroke="#c2410c" stroke-width="2"/>
      <path d="M8 12 Q20 7 32 12" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
      <path d="M12 16 Q20 12 28 16 Q30 24 28 28 Q20 30 12 28 Z" fill="#ec4899" opacity="0.9"/>
    </svg>
  `;

  document.getElementById('icon-ramen').innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path d="M5 16 L35 16 Q35 34 20 34 Q5 34 5 16 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <ellipse cx="20" cy="16" rx="15" ry="4" fill="#ea580c"/>
      <path d="M10 16 Q13 18 16 16 Q19 18 22 16 Q25 18 28 16" stroke="gold" stroke-width="1.5" fill="none"/>
      <path d="M14 24 Q18 28 22 25" stroke="#ef4444" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  document.getElementById('icon-potato').innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path d="M8 25 Q20 5 32 25 Q20 35 8 25 Z" fill="#701a75" stroke="#4a044e" stroke-width="2"/>
      <path d="M15 15 L25 15 M20 10 L20 20" stroke="#a5f3fc" stroke-width="2" stroke-linecap="round"/>
      <circle cx="28" cy="18" r="1.5" fill="#e0f2fe"/>
    </svg>
  `;

  // Init dialog
  gameEngine.setDialogue("엄마", "지각하더라도 아침 밥은 꼭 든든하게 먹고 가야지! 이거 먹고 가라!");

  const motherEl = document.getElementById('mother');
  const doorEl = document.getElementById('front-door');
  const foodMenuEl = document.getElementById('food-menu');
  const freezePanel = document.getElementById('freeze-panel');
  const progressFill = document.getElementById('progress-fill');

  const foodCheongguk = document.getElementById('food-cheongguk');
  const foodApple = document.getElementById('food-apple');
  const foodToast = document.getElementById('food-toast');
  const foodRamen = document.getElementById('food-ramen');
  const foodPotato = document.getElementById('food-potato');

  // Cheonggukjang Choice (오답)
  foodCheongguk.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) return;

    audio.playBuzzer();
    gameEngine.subtractTime(90); // 90 seconds (1:30)
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('fire', 2000); // Burning fire overlay
    gameEngine.setDialogue("주인공", "아뜨거!! 청국장을 식혀가며 뚝배기째 마시느라 1분 30초나 날아갔다! 입천장 다 까졌네! (90초 차감)");
  });

  // Apple Choice (오답)
  foodApple.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) return;

    audio.playClick();
    freezePanel.style.display = 'flex';
    
    let duration = 5000; // 5 seconds
    let elapsed = 0;
    let intervalTime = 100;
    
    const interval = setInterval(() => {
      elapsed += intervalTime;
      const pct = (elapsed / duration) * 100;
      progressFill.style.width = `${pct}%`;
      
      if (elapsed % 1000 === 0) {
        audio.playTick(true);
      }
      
      if (elapsed >= duration) {
        clearInterval(interval);
        freezePanel.style.display = 'none';
        gameEngine.setDialogue("주인공", "엄마가 정성껏 사과를 깎아주셨다. 아삭아삭 맛있는데 뛰면서 들고 갈 수는 없네! (5초 지체)");
      }
    }, intervalTime);
  });

  // Ramen Choice (오답)
  foodRamen.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) return;

    audio.playBuzzer();
    gameEngine.subtractTime(60); // 60 seconds (1 minute)
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('fire', 2000); // Hot fire overlay
    gameEngine.setDialogue("주인공", "으하악! 너무 맵고 뜨거워서 물 마시느라 1분을 길바닥에 기부했다! 배도 아픈 것 같아... (60초 차감)");
  });

  // Frozen Potato Choice (오답)
  foodPotato.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) return;

    audio.playBuzzer();
    gameEngine.subtractTime(30); // 30 seconds
    gameEngine.flashScreenDamage();
    gameEngine.showVisualPenalty('crack', 2000); // Glass cracking ice overlay
    gameEngine.setDialogue("주인공", "돌보다 단단하다! 이가 깨질 뻔해서 씹느라 30초 동안 턱 관절 운동만 했다! (30초 차감)");
  });

  // Toast Choice (정답)
  foodToast.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) return;

    momMoved = true;
    
    // Mother smiles and steps aside
    motherEl.classList.remove('angry');
    motherEl.classList.add('smile');
    motherEl.style.transform = 'translateX(-120px)'; // move left, away from door
    
    // Smile graphic update on SVG
    const mouth = document.getElementById('mom-mouth');
    const browL = document.getElementById('mom-brow-l');
    const browR = document.getElementById('mom-brow-r');
    if (mouth) mouth.setAttribute('d', 'M43 48 Q50 56 57 48'); // arc down = smile
    if (browL) { browL.setAttribute('x1', '36'); browL.setAttribute('y1', '36'); browL.setAttribute('x2', '45'); browL.setAttribute('y2', '34'); } // neutral brow
    if (browR) { browR.setAttribute('x1', '64'); browR.setAttribute('y1', '36'); browR.setAttribute('x2', '55'); browR.setAttribute('y2', '34'); }

    // Open door
    doorEl.classList.add('opened');
    doorEl.innerHTML = `<span style="font-size: 32px; animation: heartbeat 1s infinite;">☀️</span>`;

    // Hide food menu
    foodMenuEl.style.display = 'none';

    // Add toast to mouth visual in ending
    gameEngine.setHasToast(true);

    showOkEffect("아침 식사 OK!!", () => {
      gameEngine.setDialogue("주인공", "토스트를 냉큼 낚아채서 입에 물었다! 이제 열린 현관문 밖으로 뛰쳐나가자!");
    });
  });

  // Door Click
  doorEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (momMoved) {
      audio.playClick();
      gameEngine.triggerEnding(true);
    } else {
      audio.playBuzzer();
      gameEngine.setDialogue("엄마", "지각해도 밥은 한 숟갈 들고 가야 한다! 얼른 밥상에서 골라라!");
    }
  });
}
