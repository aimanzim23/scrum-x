export const COMPOSE_PLACEHOLDERS = [
  "Yesterday: slayed it. Today: slaying more. Blockers: none (hopefully).",
  "Yesterday I conquered... Today I shall... Currently being blocked by...",
  "What did I ship? What am I shipping? What's standing in my way?",
  "Past wins, current mission, active nemeses — go.",
  "Yesterday's hero moment, today's plan, and whatever's in my way.",
  "Done: [your wins]. Doing: [your quest]. Stuck on: [the villain].",
  "Recap yesterday, declare today, name your blockers. Make it snappy.",
  "What I did, what I'm doing, and what's daring to slow me down.",
  "Yesterday was a vibe. Today's looking good too. Unless... blockers?",
  "Wins from yesterday, agenda for today, and anything blocking the masterplan.",
];

export function randomPlaceholder(): string {
  return COMPOSE_PLACEHOLDERS[Math.floor(Math.random() * COMPOSE_PLACEHOLDERS.length)];
}
