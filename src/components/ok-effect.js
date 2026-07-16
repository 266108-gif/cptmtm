import { audio } from '../audio.js';

/**
 * Creates and animations a giant comic-style OK!! popup.
 * @param {string} text - Message to display (e.g. "교복 장착 OK!!")
 * @param {Function} [callback] - Executed after the animation finishes
 */
export function showOkEffect(text, callback) {
  // Play chime sound
  audio.playOk();

  const container = document.getElementById('game-container') || document.body;

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'ok-popup-overlay';
  
  const content = document.createElement('div');
  content.className = 'ok-popup-content';
  content.innerText = text;

  overlay.appendChild(content);
  container.appendChild(overlay);

  // Clean up after 1s
  setTimeout(() => {
    overlay.remove();
    if (callback) callback();
  }, 1000);
}
