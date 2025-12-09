/**
 * API Service for communicating with the backend
 */

// API configuration - can be set via environment variables or use defaults
// In Vite, environment variables prefixed with VITE_ are available via import.meta.env
// For now, we'll use defaults that can be overridden
const API_BASE_URL = 'http://localhost:8000/api';
const DEFAULT_API_TOKEN = 'shooting-game-api-token-2024';

// Cache for API token - will be fetched from backend on first use
let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

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
 * Get API token from backend (with caching)
 */
async function getApiTokenInternal(): Promise<string> {
  // If we already have a cached token, return it
  if (cachedToken) {
    return cachedToken;
  }
  
  // If there's already a request in progress, wait for it
  if (tokenPromise) {
    return tokenPromise;
  }
  
  // Fetch token from backend
  tokenPromise = (async () => {
    try {
      console.log('Fetching API token from backend...');
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.warn(`Failed to get token from API (${response.status}), using default token`);
        return DEFAULT_API_TOKEN;
      }

      const data = await response.json();
      const token = data.token || DEFAULT_API_TOKEN;
      console.log('API token fetched successfully');
      cachedToken = token;
      return token;
    } catch (error) {
      console.error('Error getting API token:', error);
      console.warn('Using default token as fallback');
      return DEFAULT_API_TOKEN;
    } finally {
      tokenPromise = null;
    }
  })();
  
  return tokenPromise;
}

/**
 * Get authorization headers with token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getApiTokenInternal();
  return {
    'token': token,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch leaderboard from backend
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching leaderboard from:', `${API_BASE_URL}/leaderboard?limit=${limit}`);
    console.log('Using token:', headers['token'] ? '***' : 'MISSING');
    
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: headers,
    });

    console.log('Leaderboard response status:', response.status, response.statusText);

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
    console.log('Leaderboard API response data:', data);
    
    // Ensure entries is an array and has the correct structure
    if (data.entries && Array.isArray(data.entries)) {
      const mappedEntries = data.entries.map(entry => ({
        name: entry.name || 'Anonymous',
        score: entry.score || 0,
        maxCombo: entry.maxCombo || 0,
        timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : (entry.timestamp ? parseInt(String(entry.timestamp)) : Date.now())
      }));
      console.log('Mapped leaderboard entries:', mappedEntries);
      return mappedEntries;
    }
    console.warn('No entries in leaderboard response or entries is not an array');
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

    const headers = await getAuthHeaders();
    
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
 * This is a public function that can be called to get the current token
 */
export async function getApiToken(): Promise<string> {
  return await getApiTokenInternal();
}

