export const INITIAL_QUESTS = [
  {
    id: 'quest-threshold',
    title: "THE UNKNOWN THRESHOLD",
    type: "DAILY SPELL",
    badgeColor: "bg-tertiary-container text-on-tertiary-container",
    rewardXP: 150,
    rewardArtifact: "SILVER WARD SHARD",
    description: "Cross into the unfamiliar. Discover a local business within your current ward that you have never stepped foot into before. Check in with the merchant sigil.",
    expiresInSeconds: 24139,
    difficulty: "Apprentice",
    icon: "radar"
  },
  {
    id: 'quest-caffeine',
    title: "THE ROASTER'S ALCHEMY",
    type: "WEEKLY EXPEDITION",
    badgeColor: "bg-neon-mint/20 text-neon-mint",
    rewardXP: 100,
    rewardArtifact: "OBSIDIAN COFFEE BEAN",
    description: "Sample a single-origin brew from Celestial Roasters or any verified independent coffee sanctum in the active ward grid.",
    expiresInSeconds: 86400 * 3,
    difficulty: "Journeyman",
    icon: "local_cafe"
  },
  {
    id: 'quest-apothecary',
    title: "HERBALIST'S RITE",
    type: "COVEN BOUNTY",
    badgeColor: "bg-electric-violet/20 text-electric-violet",
    rewardXP: 120,
    rewardArtifact: "BLUE LOTUS VIAL",
    description: "Inquire about coastal flora distillation at Alchemist Apothecary or Mandrake Elixirs. Collect their digital codex card.",
    expiresInSeconds: 86400 * 4,
    difficulty: "Adept",
    icon: "vital_signs"
  },
  {
    id: 'quest-mystery-tome',
    title: "THE VEIL OF SECRETS",
    type: "EPIC MYSTERY",
    badgeColor: "bg-magical-gold/20 text-magical-gold",
    rewardXP: 250,
    rewardArtifact: "GOLDEN CODEX KEY",
    description: "Triangulate the sonar lock on Sector-09 and unlock the clandestine entrance to The Obsidian Tome.",
    expiresInSeconds: 86400 * 2,
    difficulty: "Master",
    icon: "auto_awesome"
  }
];
