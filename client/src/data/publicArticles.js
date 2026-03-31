function demoTranslations(title, body) {
  return {
    tl: { title, body },
    ceb: { title: `[Cebuano] ${title}`, body },
    ilo: { title: `[Ilocano] ${title}`, body },
    hil: { title: `[Hiligaynon] ${title}`, body },
    war: { title: `[Waray] ${title}`, body },
    pam: { title: `[Kapampangan] ${title}`, body },
  };
}

export const PUBLIC_ARTICLES = [
  {
    id: "metro-transport-001",
    category: "Top Story",
    author: "Paraluman Newsroom",
    publishedAt: "2026-03-31T09:20:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Commuter volume climbed early this morning as provincial terminals reopened full operations before the holiday peak.",
    translations: demoTranslations(
      "Transport agencies brace for holiday surge as terminals reopen",
      "National and local transport offices deployed additional marshals, rerouted buses, and synchronized dispatch schedules in Metro Manila as passenger traffic increased before Holy Week travel days. Officials said crowd-monitoring protocols will remain active until late evening to reduce bottlenecks and long queues."
    ),
  },
  {
    id: "energy-watch-002",
    category: "Business",
    author: "Paraluman Business Desk",
    publishedAt: "2026-03-31T07:50:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Grid operators announced reserve levels stayed manageable despite higher daytime demand.",
    translations: demoTranslations(
      "Power reserves hold steady despite hotter afternoon demand",
      "Grid operators reported stable reserve margins across Luzon and Visayas, with standby units activated during peak hours. Energy planners said no red alerts were expected this week but advised large consumers to stagger heavy-load operations in the afternoon."
    ),
  },
  {
    id: "storm-monitor-003",
    category: "Weather",
    author: "Paraluman Weather Desk",
    publishedAt: "2026-03-31T06:15:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Local governments in low-lying areas prepared contingency sites amid intermittent heavy rain.",
    translations: demoTranslations(
      "Authorities raise flood watch in seven riverside communities",
      "Municipal disaster offices pre-positioned rescue boats and emergency packs as intermittent rain persisted overnight. Barangay coordinators were instructed to update household registries and prioritize evacuation support for children and senior residents."
    ),
  },
  {
    id: "health-drive-004",
    category: "Health",
    author: "Paraluman Health Desk",
    publishedAt: "2026-03-30T15:05:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A city-wide screening effort will open in three districts for walk-in consultations.",
    translations: demoTranslations(
      "Free blood pressure and sugar checks open in district clinics",
      "The city health office launched a week-long preventive care campaign offering no-cost blood pressure and blood sugar checks. Organizers said walk-in slots would be prioritized for older adults and people with recurring symptoms."
    ),
  },
  {
    id: "campus-safety-005",
    category: "Education",
    author: "Paraluman Education Desk",
    publishedAt: "2026-03-30T13:35:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    summary:
      "School heads coordinated with police and social workers for post-incident counseling.",
    translations: demoTranslations(
      "Schools tighten gate checks and counseling support after incidents",
      "Public and private schools in several cities updated entry controls and expanded student counseling schedules this week. Administrators said parent briefings and classroom advisories would continue while agencies complete risk assessments."
    ),
  },
  {
    id: "sports-finale-006",
    category: "Sports",
    author: "Paraluman Sports Desk",
    publishedAt: "2026-03-30T10:40:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    summary:
      "The finals opener drew record live viewership with late-game momentum swings.",
    translations: demoTranslations(
      "Underdog squad stuns top seed in overtime finals opener",
      "A defensive stop in the final seconds sent the championship opener into overtime, where the underdog lineup closed strong behind transition scoring. Coaches on both sides emphasized recovery and discipline ahead of Game Two."
    ),
  },
  {
    id: "culture-week-007",
    category: "Lifestyle",
    author: "Paraluman Lifestyle Desk",
    publishedAt: "2026-03-29T16:30:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Regional artists and food makers are expected to headline this weekend's showcase.",
    translations: demoTranslations(
      "City to host weekend arts and food streets festival",
      "Organizers announced a three-day cultural showcase featuring local musicians, visual artists, and community kitchens from surrounding provinces. Traffic managers will deploy rerouting plans near event corridors beginning Friday afternoon."
    ),
  },
  {
    id: "tech-rail-008",
    category: "Technology",
    author: "Paraluman Tech Desk",
    publishedAt: "2026-03-29T11:55:00.000Z",
    leadImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Pilot testing starts next month to reduce turnaround time for rider dispatch.",
    translations: demoTranslations(
      "Smart rail pilot rolls out AI dispatch for station crowding",
      "A pilot program for commuter analytics and dispatch timing will launch in selected stations next month. Officials said the system will predict queue surges and trigger platform staffing plans in real time."
    ),
  },
];

export const PUBLIC_LANGUAGE_STORAGE_KEY = "publicSelectedLanguage";