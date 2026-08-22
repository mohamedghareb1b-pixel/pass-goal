/**
 * Football-Data.org's match venue field is inconsistent (often missing or
 * just the stadium name with no city). This static table gives us a
 * reliable stadium + city per home team, keyed by our team id.
 */
export const STADIUM_BY_TEAM: Record<string, { venue: string; city: string }> = {
  arsenal: { venue: "Emirates Stadium", city: "London" },
  "aston-villa": { venue: "Villa Park", city: "Birmingham" },
  bournemouth: { venue: "Vitality Stadium", city: "Bournemouth" },
  brentford: { venue: "Gtech Community Stadium", city: "London" },
  brighton: { venue: "American Express Stadium", city: "Brighton" },
  burnley: { venue: "Turf Moor", city: "Burnley" },
  chelsea: { venue: "Stamford Bridge", city: "London" },
  "crystal-palace": { venue: "Selhurst Park", city: "London" },
  everton: { venue: "Everton Stadium", city: "Liverpool" },
  fulham: { venue: "Craven Cottage", city: "London" },
  leeds: { venue: "Elland Road", city: "Leeds" },
  liverpool: { venue: "Anfield", city: "Liverpool" },
  "man-city": { venue: "Etihad Stadium", city: "Manchester" },
  "man-united": { venue: "Old Trafford", city: "Manchester" },
  newcastle: { venue: "St James' Park", city: "Newcastle" },
  "nottingham-forest": { venue: "The City Ground", city: "Nottingham" },
  sunderland: { venue: "Stadium of Light", city: "Sunderland" },
  tottenham: { venue: "Tottenham Hotspur Stadium", city: "London" },
  "west-ham": { venue: "London Stadium", city: "London" },
  wolves: { venue: "Molineux Stadium", city: "Wolverhampton" },
};
