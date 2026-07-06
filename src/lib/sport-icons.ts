const SPORT_ICONS: Record<string, string> = {
  Tenis: '🎾',
  Pádel: '🏓',
  Fútbol: '⚽',
}

export function getSportIcon(sportName: string): string {
  return SPORT_ICONS[sportName] || '🏟️'
}
