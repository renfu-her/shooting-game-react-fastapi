/**
 * API Service for communicating with the backend
 */

// API configuration - can be set via environment variables or use defaults
// In Vite, environment variables prefixed with VITE_ are available via import.meta.env
// For now, we'll use defaults that can be overridden
const API_BASE_URL = 'http://localhost:8000/api';
const API_TOKEN = 'shooting-game-api-token-2024';

export interface LeaderboardEntry {
  name: string;
  score: number;
  maxCombo: number;
  timestamp: number;
}

export interface AddScoreRequest {
  name: string;
  score: number;
  maxCombo: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
}

/**
 * Get authorization headers with token
 */
function getAuthHeaders(): HeadersInit {
  return {
    'token': API_TOKEN,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch leaderboard from backend
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
    }

    const data: LeaderboardResponse = await response.json();
    // Ensure entries is an array and has the correct structure
    if (data.entries && Array.isArray(data.entries)) {
      return data.entries.map(entry => ({
        name: entry.name || 'Anonymous',
        score: entry.score || 0,
        maxCombo: entry.maxCombo || 0,
        timestamp: entry.timestamp || Date.now()
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

/**
 * Add score to leaderboard
 */
export async function addScoreToLeaderboard(
  name: string,
  score: number,
  maxCombo: number
): Promise<LeaderboardEntry> {
  try {
    const requestBody: AddScoreRequest = {
      name,
      score,
      maxCombo,
    };

    const headers = getAuthHeaders();
    
    // Debug: Log headers (remove in production)
    console.log('API Request Headers:', {
      'token': headers['token'] ? '***' : 'MISSING',
      'Content-Type': headers['Content-Type']
    });

    const response = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to add score: ${response.status} ${response.statusText}`);
    }

    const data: LeaderboardEntry = await response.json();
    // Ensure the response has all required fields
    return {
      name: data.name || 'Anonymous',
      score: data.score || 0,
      maxCombo: data.maxCombo || 0,
      timestamp: data.timestamp || Date.now()
    };
  } catch (error) {
    console.error('Error adding score to leaderboard:', error);
    throw error;
  }
}

/**
 * Get API token (for verification)
 */
export async function getApiToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token || API_TOKEN;
  } catch (error) {
    console.error('Error getting API token:', error);
    return API_TOKEN; // Fallback to default
  }
}

