import { GameStats } from "../types";

export const generateCoachCommentary = async (stats: GameStats): Promise<string> => {
  // Simulate a short "thinking" delay for the UI effect
  await new Promise(resolve => setTimeout(resolve, 600));

  const { score, maxCombo } = stats;

  if (score === 0) {
      return "Did you forget to throw the ball? 🏀 Wake up and get in the game!";
  }

  if (score < 100) {
    return "Warm-up round? 🥶 You gotta shoot faster! Focus on the rhythm and try to stack those combos.";
  } else if (score < 250) {
    return "Solid effort! 👊 You're finding the range. Work on that release speed to break into the big leagues.";
  } else if (score < 500) {
    return "You're on fire! 🔥 Great accuracy and impressive speed. That max combo was doing some heavy lifting!";
  } else {
    return `ABSOLUTE LEGEND! 👑 ${maxCombo} combo streak?! The rim is still smoking. Unbelievable performance!`;
  }
};