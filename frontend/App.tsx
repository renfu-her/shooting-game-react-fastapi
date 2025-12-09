import React, { useState, useEffect, useRef } from 'react';
import ArcadeCanvas from './components/ArcadeCanvas';
import { GameState, GameStats, LeaderboardEntry } from './types';
import { generateCoachCommentary } from './services/geminiService';
import { getLeaderboard, addScoreToLeaderboard } from './services/apiService';

const GAME_DURATION = 180; // 3 minutes
const LEADERBOARD_KEY = 'neon-hoops-leaderboard';
const PLAYER_NAME_KEY = 'neon-hoops-player-name';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [shotsMade, setShotsMade] = useState(0); 
  
  const [playerName, setPlayerName] = useState('');
  const [isNameError, setIsNameError] = useState(false);

  const [commentary, setCommentary] = useState<string>("");
  const [loadingCommentary, setLoadingCommentary] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  // To highlight the newest score in the list
  const [lastEntryTimestamp, setLastEntryTimestamp] = useState<number | null>(null);

  // Key to force re-mount of ArcadeCanvas on new game
  const [gameSessionId, setGameSessionId] = useState(0);

  // Use 'number' for browser environments, generally safe cast for setInterval ID
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Load leaderboard from backend on mount
    const loadLeaderboard = async () => {
      try {
        const entries = await getLeaderboard(10);
        setLeaderboard(entries);
      } catch (error) {
        console.error("Failed to load leaderboard from backend, using localStorage fallback", error);
        // Fallback to localStorage
        const saved = localStorage.getItem(LEADERBOARD_KEY);
        if (saved) {
          try {
            setLeaderboard(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse leaderboard", e);
          }
        }
      }
    };
    
    loadLeaderboard();
    
    // Load last player name
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const saveScoreToLeaderboard = async (finalScore: number, finalMaxCombo: number) => {
    const finalName = playerName.trim() || "Anonymous";
    
    try {
      // Save to backend
      const newEntry = await addScoreToLeaderboard(finalName, finalScore, finalMaxCombo);
      setLastEntryTimestamp(newEntry.timestamp);
      
      // Reload leaderboard from backend
      const entries = await getLeaderboard(10);
      setLeaderboard(entries);
    } catch (error) {
      console.error("Failed to save score to backend, using localStorage fallback", error);
      // Fallback to localStorage
      const newEntry: LeaderboardEntry = {
        name: finalName,
        score: finalScore,
        maxCombo: finalMaxCombo,
        timestamp: Date.now()
      };
      setLastEntryTimestamp(newEntry.timestamp);

      setLeaderboard(prev => {
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score) // Descending
          .slice(0, 10); // Keep top 10
        
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const startGame = () => {
    if (!playerName.trim()) {
      setIsNameError(true);
      return;
    }
    
    // Save name for next time
    localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
    setIsNameError(false);

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setShotsMade(0);
    setTimeLeft(GAME_DURATION);
    setCommentary("");
    setGameSessionId(prev => prev + 1); // Increment ID to reset canvas
    setGameState(GameState.PLAYING);
  };

  const togglePause = () => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  const handleQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(GameState.MENU);
  };

  const handleGameOver = async () => {
    setGameState(GameState.GAME_OVER);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save Score (async)
    await saveScoreToLeaderboard(score, maxCombo);

    setLoadingCommentary(true);
    const stats: GameStats = {
      score,
      maxCombo,
      accuracy: 1.0, // Simplified for now
      shotsTaken: shotsMade // Approximation
    };
    const text = await generateCoachCommentary(stats);
    setCommentary(text);
    setLoadingCommentary(false);
  };

  const handleScoreUpdate = (points: number, isCombo: boolean) => {
    setScore(prev => prev + points);
    setShotsMade(prev => prev + 1);
    
    if (isCombo) {
      setCombo(prev => {
        const newCombo = prev + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
    } else {
      setCombo(1);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Render Helpers
  const renderLeaderboardList = () => (
    <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="grid grid-cols-4 gap-2 bg-slate-800 p-3 text-xs uppercase font-bold text-slate-400 tracking-wider">
        <div className="col-span-1">Rank</div>
        <div className="col-span-1">Name</div>
        <div className="col-span-1 text-right">Combo</div>
        <div className="col-span-1 text-right">Score</div>
      </div>
      {leaderboard.length === 0 ? (
        <div className="p-4 text-center text-slate-500 italic">No records yet. Be the first!</div>
      ) : (
        leaderboard.map((entry, index) => {
          const isNew = entry.timestamp === lastEntryTimestamp;
          return (
            <div 
              key={entry.timestamp} 
              className={`grid grid-cols-4 gap-2 p-3 border-b border-slate-800 text-sm items-center ${isNew ? 'bg-yellow-900/20 text-yellow-200 animate-pulse' : 'text-slate-300'}`}
            >
              <div className="col-span-1 font-mono font-bold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="col-span-1 truncate font-medium text-white">
                {entry.name || 'Anonymous'}
              </div>
              <div className="col-span-1 text-right font-mono text-pink-400">{entry.maxCombo}</div>
              <div className="col-span-1 text-right font-mono font-bold text-cyan-400">{entry.score}</div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    // Outer Container: Handles Desktop Background and centering
    <div className="w-full h-[100dvh] bg-zinc-900 flex items-center justify-center overflow-hidden font-sans">
      
      {/* Mobile Device Container: Limits width on desktop, full size on mobile */}
      <div className="relative w-full h-full md:max-w-[480px] md:h-[95vh] md:max-h-[900px] md:rounded-3xl md:border-[8px] md:border-slate-800 md:shadow-2xl bg-slate-950 text-white overflow-hidden flex flex-col shrink-0">
        
        {/* Header / HUD */}
        <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none select-none">
          <div className="flex flex-col items-start">
            <div className="text-4xl font-black italic tracking-tighter text-yellow-400 drop-shadow-lg">
              {score} <span className="text-sm font-normal text-white/70 not-italic">PTS</span>
            </div>
            {combo > 1 && (
              <div className="text-2xl font-bold text-pink-500 animate-pulse mt-1">
                x{combo} COMBO!
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Pause Button */}
            {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
              <button 
                onClick={togglePause}
                className="pointer-events-auto w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors border border-slate-600 mb-1 backdrop-blur-sm"
                aria-label="Pause Game"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              </button>
            )}

            <div className={`text-4xl font-mono font-bold drop-shadow-md ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        {/* We use gameSessionId as a key to force re-mounting (resetting) the canvas on new game start */}
        <ArcadeCanvas 
          key={gameSessionId}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          gameActive={gameState === GameState.PLAYING}
          timeLeft={timeLeft}
        />

        {/* Menu Overlay */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 tracking-tighter animate-float text-center">
              HOOP SHOOTING<br/>GAME
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xs mx-auto">
              Rapid Fire Mode: 3 Minutes.<br/>
              Drag & Release. Unlimited Balls. Continuous Combos!
            </p>
            
            <div className="w-full max-w-xs mb-6">
              <label htmlFor="playerName" className="block text-left text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter Name
              </label>
              <input 
                id="playerName"
                type="text" 
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (e.target.value.trim()) setIsNameError(false);
                }}
                maxLength={12}
                placeholder="PLAYER ONE"
                className={`w-full bg-slate-800 text-white font-mono text-xl px-4 py-3 rounded-lg border-2 outline-none focus:border-cyan-400 transition-colors uppercase placeholder:text-slate-600 ${isNameError ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}
              />
              {isNameError && <div className="text-red-500 text-xs mt-1 text-left font-bold">Please enter a name to play</div>}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={startGame}
                className="group relative px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-2xl uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all hover:scale-105 active:scale-95"
              >
                Start Game
                <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-20"></div>
              </button>
              
              <button
                onClick={() => setGameState(GameState.LEADERBOARD)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider rounded-full border border-slate-600 transition-colors"
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Only Overlay (from Menu) */}
        {gameState === GameState.LEADERBOARD && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col p-6 animate-fade-in select-none">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white uppercase italic">High Scores</h2>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
                >
                  ✕
                </button>
             </div>
             <div className="flex-1 overflow-y-auto">
               {renderLeaderboardList()}
             </div>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in select-none">
            <h2 className="text-5xl font-black text-white uppercase italic mb-8 tracking-widest drop-shadow-xl">Paused</h2>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={togglePause}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xl uppercase tracking-wider rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Resume
              </button>
              <button 
                onClick={handleQuit}
                className="px-8 py-4 bg-slate-800 hover:bg-red-500/80 text-white font-bold text-lg uppercase tracking-wider rounded-full border-2 border-slate-600 hover:border-red-400 transition-colors"
              >
                Quit Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-6 animate-fade-in select-none overflow-y-auto">
            <div className="flex-none flex flex-col items-center justify-center mt-4">
              <h2 className="text-5xl font-black text-white mb-2 uppercase italic transform -skew-x-6">Time's Up!</h2>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                  <div className="text-sm text-slate-400 uppercase">Score</div>
                  <div className="text-4xl font-bold text-yellow-400">{score}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                  <div className="text-sm text-slate-400 uppercase">Max Combo</div>
                  <div className="text-4xl font-bold text-pink-500">{maxCombo}</div>
                </div>
              </div>

              <div className="max-w-xs w-full bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 mb-8 shadow-xl">
                <h3 className="text-cyan-400 font-bold uppercase text-sm mb-2 flex items-center gap-2 justify-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  AI Coach Feedback
                </h3>
                <p className="text-lg text-white leading-relaxed min-h-[4rem] text-center">
                  {loadingCommentary ? (
                    <span className="animate-pulse">Analyzing performance...</span>
                  ) : (
                    commentary
                  )}
                </p>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="flex-1 max-w-xs w-full mx-auto mb-8">
              <h3 className="text-white font-bold uppercase text-sm mb-3 text-center tracking-wider">Top 10 Rankings</h3>
              {renderLeaderboardList()}
            </div>

            <div className="flex-none sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-black via-black to-transparent w-full flex justify-center">
              <button 
                onClick={startGame}
                className="px-10 py-4 bg-white hover:bg-slate-200 text-slate-900 font-black text-xl uppercase tracking-wide rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;