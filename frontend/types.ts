export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD' // New state for viewing from menu
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  pos: Vector2;
  vel: Vector2;
  radius: number;
  isDragging: boolean;
  dragStart: Vector2 | null;
  dragCurrent: Vector2 | null;
  active: boolean; // false if waiting to be thrown
  scored: boolean; // prevent double counting
  createdAt: number; // for cleanup
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface GameStats {
  score: number;
  maxCombo: number;
  accuracy: number; // shots made / shots taken
  shotsTaken: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  maxCombo: number;
  timestamp: number;
}