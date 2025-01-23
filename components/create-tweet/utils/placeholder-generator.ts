const create_alpha_placeholder_phrases = [
  "What's pumping? 🚀",
  "Shill your next play 💎",
  "Drop some alpha ✨",
  "Share the sauce 🔥",
  "What's trending? 👀",
  "Any big moves today? 💰",
  "Got a hot take? 📈",
  "What's the play? 🎲",
  "What’s the vibe? 🌟",
  "Based thoughts? 🧠",
  "Spill the alpha 💥",
  "Who's leading the charge? 💪",
  "Markets looking spicy? 🔥",
  "What’s your next move? 👀",
  "Time to ape in? 🐒",
  "Let’s ride the wave! 🚀",
  "Any hidden gems? 💎",
  "Ready to moon? 🌙",
];

const comment_placeholder_phrases = [
  "Shill your thoughts",
  "Based take?",
  "Share your signal",
  "Drop some wisdom",
  "Ape your reply",
  "Degen thoughts?",
  "Add your sauce",
  "Your move, degen",
];

export const getRandomPlaceholder = (type) => {
  let phrases;
  if (type === "alpha") {
    phrases = create_alpha_placeholder_phrases;
  } else if (type === "comment") {
    phrases = comment_placeholder_phrases;
  } else {
    throw new Error("Invalid type. Use 'alpha' or 'comment'.");
  }

  return phrases[Math.floor(Math.random() * phrases.length)];
};
