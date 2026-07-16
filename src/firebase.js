import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Environment variables from Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase settings are filled
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' && 
  firebaseConfig.apiKey.trim() !== '';

let auth = null;
let db = null;
let useMock = !isFirebaseConfigured;

if (!useMock) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase, falling back to mock storage:", error);
    useMock = true;
  }
} else {
  console.warn("⚠️ Firebase credentials not configured in .env. Using localStorage mock data.");
}

// ==========================================
// MOCK DATABASE & AUTH IMPLEMENTATION (Fallback)
// ==========================================
const mockDb = {
  users: JSON.parse(localStorage.getItem('game_users') || '{}'),
  currentUser: JSON.parse(localStorage.getItem('game_current_user') || 'null'),
  scores: JSON.parse(localStorage.getItem('game_scores') || '[]'),
  
  listeners: [],
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },
  
  notify() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }
};

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export function onAuthChange(callback) {
  if (useMock) {
    return mockDb.onAuthStateChanged(callback);
  } else {
    return onAuthStateChanged(auth, callback);
  }
}

export async function registerEmail(email, password) {
  if (useMock) {
    if (mockDb.users[email]) {
      throw new Error("이미 존재하는 이메일입니다.");
    }
    const mockUser = { uid: 'mock_' + Date.now(), email, isAnonymous: false };
    mockDb.users[email] = { password, ...mockUser };
    localStorage.setItem('game_users', JSON.stringify(mockDb.users));
    
    mockDb.currentUser = mockUser;
    localStorage.setItem('game_current_user', JSON.stringify(mockUser));
    mockDb.notify();
    return mockUser;
  } else {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
}

export async function loginEmail(email, password) {
  if (useMock) {
    const userRecord = mockDb.users[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error("이메일 혹은 비밀번호가 일치하지 않습니다.");
    }
    const mockUser = { uid: userRecord.uid, email: userRecord.email, isAnonymous: false };
    mockDb.currentUser = mockUser;
    localStorage.setItem('game_current_user', JSON.stringify(mockUser));
    mockDb.notify();
    return mockUser;
  } else {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
}

export async function loginGuest() {
  if (useMock) {
    const guestUser = { uid: 'guest_' + Date.now(), email: 'guest@commute.local', isAnonymous: true };
    mockDb.currentUser = guestUser;
    localStorage.setItem('game_current_user', JSON.stringify(guestUser));
    mockDb.notify();
    return guestUser;
  } else {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  }
}

export async function logout() {
  if (useMock) {
    mockDb.currentUser = null;
    localStorage.removeItem('game_current_user');
    mockDb.notify();
  } else {
    await signOut(auth);
  }
}

// ==========================================
// FIRESTORE RANKING APIs
// ==========================================

/**
 * Saves a high score to Firestore or Mock LocalStorage.
 * @param {string} name - Player display name
 * @param {number} timeRemainingSeconds - Remaining time in seconds (higher is better)
 */
export async function saveScore(name, timeRemainingSeconds) {
  const timestamp = new Date().toISOString();
  if (useMock) {
    const newScore = { name, timeRemaining: timeRemainingSeconds, timestamp };
    mockDb.scores.push(newScore);
    // Sort descending (highest remaining time is best)
    mockDb.scores.sort((a, b) => b.timeRemaining - a.timeRemaining);
    // Keep top 100
    mockDb.scores = mockDb.scores.slice(0, 100);
    localStorage.setItem('game_scores', JSON.stringify(mockDb.scores));
    return newScore;
  } else {
    const docRef = await addDoc(collection(db, "rankings"), {
      name,
      timeRemaining: timeRemainingSeconds,
      timestamp
    });
    return docRef;
  }
}

/**
 * Gets the top 10 players from Firestore or Mock LocalStorage.
 * @returns {Promise<Array>} List of scores [{name, timeRemaining, timestamp}]
 */
export async function getRankings() {
  if (useMock) {
    return mockDb.scores.slice(0, 10);
  } else {
    const rankingsRef = collection(db, "rankings");
    const q = query(rankingsRef, orderBy("timeRemaining", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    return results;
  }
}

export function isUsingMock() {
  return useMock;
}
