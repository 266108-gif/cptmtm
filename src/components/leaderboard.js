import { getRankings, isUsingMock } from '../firebase.js';

/**
 * Format seconds to MM:SS format
 * @param {number} totalSeconds 
 */
function formatTime(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export async function renderLeaderboard(containerEl) {
  containerEl.innerHTML = `
    <div class="leaderboard-title">
      <span>🏆</span> 명예의 전당 (Top 10) 
      ${isUsingMock() ? '<span style="font-size:10px;color:rgba(255,255,255,0.3)">(로컬 Mock)</span>' : ''}
    </div>
    <div class="leaderboard" id="leaderboard-list">
      <div class="leaderboard-empty">기록 불러오는 중...</div>
    </div>
  `;

  const listEl = containerEl.querySelector('#leaderboard-list');

  try {
    const scores = await getRankings();
    if (!scores || scores.length === 0) {
      listEl.innerHTML = `<div class="leaderboard-empty">아직 랭킹 기록이 없습니다. 첫 주인공이 되어보세요!</div>`;
      return;
    }

    listEl.innerHTML = scores.map((score, index) => {
      return `
        <div class="leaderboard-row">
          <span class="leaderboard-rank">${index + 1}</span>
          <span class="leaderboard-name">${escapeHtml(score.name)}</span>
          <span class="leaderboard-time">${formatTime(score.timeRemaining)}</span>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Failed to load rankings:", error);
    listEl.innerHTML = `<div class="leaderboard-empty" style="color:var(--color-accent)">랭킹을 불러오지 못했습니다.</div>`;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
