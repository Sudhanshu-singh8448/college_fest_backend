// Seeding script fragment — 8 badge definitions for the database
export const BADGE_DEFINITIONS = [
  {
    name: 'First Blood',
    description: 'Register for your very first event',
    iconUrl: '🌟',
    condition: 'FIRST_REGISTRATION',
    xpReward: 25,
  },
  {
    name: 'Fire Starter',
    description: 'Attend 3 or more events',
    iconUrl: '🔥',
    condition: 'ATTEND_3_EVENTS',
    xpReward: 50,
  },
  {
    name: 'Event Royalty',
    description: 'Attend 10 or more events',
    iconUrl: '👑',
    condition: 'ATTEND_10_EVENTS',
    xpReward: 100,
  },
  {
    name: 'Sharpshooter',
    description:
      'Register AND attend an event within 10 minutes of it going live',
    iconUrl: '🎯',
    condition: 'FAST_REGISTER',
    xpReward: 75,
  },
  {
    name: 'Speedster',
    description: 'Be one of the first 10 people to register for any event',
    iconUrl: '⚡',
    condition: 'TOP_10_REGISTER',
    xpReward: 50,
  },
  {
    name: 'Night Owl',
    description: 'Check in to an event or log in after midnight',
    iconUrl: '🦉',
    condition: 'NIGHT_OWL',
    xpReward: 25,
  },
  {
    name: 'Champion',
    description: 'Win any event or competition',
    iconUrl: '🏆',
    condition: 'WIN_EVENT',
    xpReward: 150,
  },
  {
    name: 'Digital Native',
    description: 'Maintain a 7-day consecutive login streak',
    iconUrl: '📱',
    condition: 'STREAK_7_DAYS',
    xpReward: 75,
  },
];
