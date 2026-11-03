import { Game } from '../types/game';

export const INITIAL_GAMES: Game[] = [
  {
    id: 'game-cyber-racer-3d',
    title: 'Neon Drift: Tokyo Horizon 3D',
    slug: 'neon-drift-tokyo-horizon-3d',
    description: 'High-speed 3D pseudo-arcade highway racing with futuristic neon supercars, slipstream boosts, and tight expressway turns.',
    category: 'Racing',
    secondaryCategories: ['Car', '3D', 'Arcade', 'Action'],
    thumbnail: '/src/assets/images/cyber_racer_game_1793687186298.jpg',
    isPremium: false,
    rating: 4.9,
    ratingCount: 3240,
    playersCount: 14200,
    trending: true,
    popular: true,
    featured: true,
    tags: ['Racing', 'Supercar', '3D', 'Arcade', 'Fast Paced', 'Nitro'],
    engineType: 'canvas-racer',
    instructions: [
      'Steer left and right to dodge rival traffic and highway barricades.',
      'Collect luminous blue turbo nitro orbs to charge your hyper-boost meter.',
      'Survive as distance increases and the speed dynamically accelerates!'
    ],
    controls: [
      { key: 'Left / Right Arrow or A / D', action: 'Steer Vehicle' },
      { key: 'Up Arrow or W / Space', action: 'Trigger Nitro Boost' },
      { key: 'P or Esc', action: 'Pause / Resume' }
    ],
    releaseDate: '2026-08-15',
    developer: 'GameZone Studio Apex'
  },
  {
    id: 'game-space-defender-arcade',
    title: 'Galactic Vanguard: Nova Assault',
    slug: 'galactic-vanguard-nova-assault',
    description: 'Intense retro-modern space fighter shooter. Command your Starfighter X-1, obliterate alien squadrons, and gather tactical energy shields.',
    category: 'Shooting',
    secondaryCategories: ['Action', 'Arcade', 'Brain'],
    thumbnail: '/src/assets/images/space_defender_game_1793687187300.jpg',
    isPremium: false,
    rating: 4.8,
    ratingCount: 2890,
    playersCount: 9850,
    trending: true,
    popular: true,
    tags: ['Shooting', 'Sci-Fi', 'Space', 'Arcade', 'Lasers', 'Retro'],
    engineType: 'canvas-space-shooter',
    instructions: [
      'Navigate your fighter across the quadrant to dodge alien plasma missiles.',
      'Fire continuous plasma blasters to destroy waves of enemy interceptors.',
      'Pick up repair shields, weapon tri-spreads, and nova orbital bombs.'
    ],
    controls: [
      { key: 'Arrow Keys or W/A/S/D', action: 'Ship Flight Maneuvers' },
      { key: 'Spacebar', action: 'Fire Main Plasma Blasters' },
      { key: 'B', action: 'Deploy Smart Bomb (if charged)' },
      { key: 'P', action: 'Pause Game' }
    ],
    releaseDate: '2026-07-20',
    developer: 'CosmoCraft Interactive'
  },
  {
    id: 'game-penalty-shootout-pro',
    title: 'World Cup Penalty Striker Pro',
    slug: 'world-cup-penalty-striker-pro',
    description: 'Feel the electric stadium tension in the ultimate football penalty shootout. Aim trajectory, curve the ball, and outwit the goalkeeper.',
    category: 'Football',
    secondaryCategories: ['Sports', 'Arcade', 'Action'],
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    rating: 4.7,
    ratingCount: 1980,
    playersCount: 8120,
    trending: true,
    recommended: true,
    tags: ['Football', 'Soccer', 'Sports', 'Penalty', 'Skill', 'Tournament'],
    engineType: 'canvas-penalty-shootout',
    instructions: [
      'Select your shot target angle inside the goal frame.',
      'Lock in shot power and apply left/right spin curve.',
      'Score 5 consecutive goals against an adapting AI goalkeeper.'
    ],
    controls: [
      { key: 'Mouse Click / Tap & Drag', action: 'Aim & Power Kick' },
      { key: 'A / D or Left / Right', action: 'Curve Trajectory' },
      { key: 'Space', action: 'Quick Kick' }
    ],
    releaseDate: '2026-06-10',
    developer: 'Striker Precision'
  },
  {
    id: 'game-street-hoops-3pt',
    title: 'Urban Streetball: 3-Point Clutch',
    slug: 'urban-streetball-3-point-clutch',
    description: 'Fast-paced street basketball 3-point shootout challenge. Time your release, master the arc, and hit buzzer-beater triples.',
    category: 'Basketball',
    secondaryCategories: ['Sports', 'Arcade', 'Casual'],
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    rating: 4.8,
    ratingCount: 1450,
    playersCount: 6540,
    popular: true,
    tags: ['Basketball', 'Sports', '3-Pointer', 'Streetball', 'Timing'],
    engineType: 'canvas-basketball-3pt',
    instructions: [
      'Click or tap and hold to power up the shooting angle meter.',
      'Release the basketball precisely at the sweet spot peak for a swish.',
      'Chain combos before the 60-second shot clock expires.'
    ],
    controls: [
      { key: 'Space or Left Click', action: 'Hold to Charge & Release to Shoot' },
      { key: 'Arrow Keys', action: 'Adjust Angle Stance' }
    ],
    releaseDate: '2026-05-18',
    developer: 'SlamDunk Studios'
  },
  {
    id: 'game-tactical-strike-prime',
    title: 'Shadow Operative: Tactical Strike',
    slug: 'shadow-operative-tactical-strike',
    description: 'Premium stealth-action tactical combat. Infiltrate enemy compounds, deploy tactical drones, and neutralize hostiles with precision.',
    category: 'Action',
    secondaryCategories: ['Shooting', 'Strategy', 'Adventure'],
    thumbnail: '/src/assets/images/tactical_strike_game_1793687187112.jpg',
    isPremium: true,
    rating: 4.9,
    ratingCount: 4120,
    playersCount: 16800,
    trending: true,
    featured: true,
    recommended: true,
    tags: ['Action', 'Tactical', 'Shooting', 'Stealth', 'Premium', 'Special Ops'],
    engineType: 'canvas-tactical-strike',
    instructions: [
      'Sneak behind tactical cover crates to avoid enemy spotlights.',
      'Aim crosshair and eliminate targets using silenced weaponry.',
      'Collect security keycards to unlock the extraction zone.'
    ],
    controls: [
      { key: 'W/A/S/D or Arrow Keys', action: 'Tactical Movement' },
      { key: 'Mouse Move & Click', action: 'Aim & Fire' },
      { key: 'R', action: 'Reload Ammo Clip' },
      { key: 'C', action: 'Crouch Behind Cover' }
    ],
    releaseDate: '2026-09-01',
    developer: 'Vanguard Simulation'
  },
  {
    id: 'game-cyber-fusion-2048',
    title: 'Cyber Fusion: Neon 2048',
    slug: 'cyber-fusion-neon-2048',
    description: 'Mesmerizing cyberpunk twist on the classic 2048 puzzle formula with dynamic neon lighting, combo streaks, and sound synthesis.',
    category: 'Puzzle',
    secondaryCategories: ['Brain', 'Casual', 'Strategy'],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    rating: 4.9,
    ratingCount: 5210,
    playersCount: 21500,
    popular: true,
    recommended: true,
    tags: ['Puzzle', '2048', 'Brain', 'Cyberpunk', 'Numbers', 'Addictive'],
    engineType: 'canvas-cyber-fusion',
    instructions: [
      'Swipe or use arrow keys to slide all neon energy cores across the 4x4 grid.',
      'When two tiles with identical numbers collide, they fuse into one double-power core!',
      'Reach the legendary 2048 Cyber Core to achieve maximum fusion victory.'
    ],
    controls: [
      { key: 'Arrow Keys or W/A/S/D', action: 'Slide Grid Tiles' },
      { key: 'Touch Swipe', action: 'Mobile Slide Control' },
      { key: 'U', action: 'Undo Previous Move' },
      { key: 'R', action: 'Reset Grid' }
    ],
    releaseDate: '2026-04-12',
    developer: 'HexaLogic Labs'
  },
  {
    id: 'game-turbo-brick-breaker',
    title: 'HyperBreak: Cyber Brick Breaker',
    slug: 'hyperbreak-cyber-brick-breaker',
    description: 'Explosive arcade brick breaker with lasers, multi-ball madness, energy shields, and high-octane synthwave aesthetics.',
    category: 'Arcade',
    secondaryCategories: ['Casual', 'Action', 'Brain'],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    rating: 4.6,
    ratingCount: 1640,
    playersCount: 5790,
    tags: ['Arcade', 'Brick Breaker', 'Retro', 'Powerups', 'Casual'],
    engineType: 'canvas-brick-breaker',
    instructions: [
      'Move your magnetic energy paddle to rebound the plasma sphere.',
      'Smash all crystal data bricks while catching falling laser & multi-ball capsules.',
      'Do not let the ball drop into the abyss!'
    ],
    controls: [
      { key: 'Mouse or Left/Right Arrow', action: 'Move Energy Paddle' },
      { key: 'Spacebar', action: 'Launch Ball / Fire Lasers' },
      { key: 'P', action: 'Pause Game' }
    ],
    releaseDate: '2026-03-25',
    developer: 'PulseWave Games'
  },
  {
    id: 'game-memory-matrix-reflex',
    title: 'Synapse: Cyber Memory Matrix',
    slug: 'synapse-cyber-memory-matrix',
    description: 'Next-generation brain training and reflex memory challenge. Memorize flashing neural patterns, test spatial recall, and elevate focus.',
    category: 'Brain',
    secondaryCategories: ['Puzzle', 'Casual', 'Strategy'],
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    rating: 4.8,
    ratingCount: 2100,
    playersCount: 7400,
    trending: true,
    tags: ['Brain', 'Memory', 'Reflex', 'Focus', 'Cognitive', 'Premium'],
    engineType: 'canvas-memory-matrix',
    instructions: [
      'Watch carefully as the neural grid illuminates a randomized pattern.',
      'Replicate the exact sequence by clicking the corresponding matrix nodes.',
      'Beat 15 escalating rounds to unlock grandmaster cognitive rank.'
    ],
    controls: [
      { key: 'Mouse Click / Touch', action: 'Select Matrix Node' },
      { key: 'Spacebar', action: 'Ready for Next Sequence' }
    ],
    releaseDate: '2026-08-01',
    developer: 'MindForge AI Lab'
  },
  {
    id: 'game-fortress-command-strategy',
    title: 'Aegis Protocol: Strategic Defense',
    slug: 'aegis-protocol-strategic-defense',
    description: 'Command futuristic defense batteries, manage uranium energy reserves, and hold perimeter lines against relentless mech swarms.',
    category: 'Strategy',
    secondaryCategories: ['Action', 'Arcade', 'Brain'],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    rating: 4.9,
    ratingCount: 3100,
    playersCount: 11200,
    popular: true,
    featured: true,
    tags: ['Strategy', 'Tower Defense', 'Tactics', 'Sci-Fi', 'Premium'],
    engineType: 'canvas-tactical-strike',
    instructions: [
      'Position tactical defense units along strategic access chokepoints.',
      'Upgrade weapon ranges, kinetic cannons, and EMP disruptors.',
      'Protect the core power generator at all costs.'
    ],
    controls: [
      { key: 'Click & Drag', action: 'Deploy Units' },
      { key: '1, 2, 3', action: 'Select Defense Weapon Type' },
      { key: 'Space', action: 'Speed up simulation x2' }
    ],
    releaseDate: '2026-09-12',
    developer: 'IronGrid Studios'
  },
  {
    id: 'game-neon-racer-gt',
    title: 'Apex Overdrive: Grand Prix',
    slug: 'apex-overdrive-grand-prix',
    description: 'High-octane championship circuit racing. Compete against elite AI drivers, draft for top speed, and claim podium trophies.',
    category: 'Car',
    secondaryCategories: ['Racing', '3D', 'Sports'],
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    rating: 4.8,
    ratingCount: 2750,
    playersCount: 9400,
    popular: true,
    tags: ['Car', 'Racing', 'Grand Prix', 'Speed', 'Tournament', 'Premium'],
    engineType: 'canvas-racer',
    instructions: [
      'Hit the racing line and feather the throttle on sharp chicanes.',
      'Slipstream behind rival race cars to gain draft acceleration.',
      'Complete 3 intense laps in under 2 minutes to take first place.'
    ],
    controls: [
      { key: 'W or Up Arrow', action: 'Accelerate' },
      { key: 'S or Down Arrow', action: 'Brake / Reverse' },
      { key: 'A / D or Left / Right', action: 'Steering' },
      { key: 'Space', action: 'Handbrake Drift' }
    ],
    releaseDate: '2026-07-04',
    developer: 'Apex Velocity'
  },
  {
    id: 'game-quantum-maze-adventure',
    title: 'Chrono Rift: Dimensions',
    slug: 'chrono-rift-dimensions',
    description: 'Traverse an ever-shifting quantum labyrinth, manipulate timeline shifts, and unravel cosmic anomalies in this puzzle adventure.',
    category: 'Adventure',
    secondaryCategories: ['Puzzle', 'Action', 'Brain'],
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isPremium: false,
    rating: 4.7,
    ratingCount: 1820,
    playersCount: 6890,
    recommended: true,
    tags: ['Adventure', 'Mystery', 'Puzzle', 'Cosmic', 'Atmospheric'],
    engineType: 'canvas-memory-matrix',
    instructions: [
      'Navigate through shifting dimensional portals.',
      'Collect ancient chronological fragments to unlock exit gateways.',
      'Avoid temporal black holes and time distortions.'
    ],
    controls: [
      { key: 'Arrow Keys / WASD', action: 'Navigate Explorer' },
      { key: 'E / Space', action: 'Interact / Collect Chrono Stone' },
      { key: 'T', action: 'Trigger Dimensional Shift' }
    ],
    releaseDate: '2026-06-22',
    developer: 'Cosmic Drift Studio'
  },
  {
    id: 'game-clash-arena-multiplayer',
    title: 'Cyber Clash: Battle Arena',
    slug: 'cyber-clash-battle-arena',
    description: 'Real-time competitive combat simulator. Challenge bots or rival players in fast-paced 1v1 and squad brawls.',
    category: 'Multiplayer',
    secondaryCategories: ['Action', 'Strategy', 'Shooting'],
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    isPremium: true,
    rating: 4.9,
    ratingCount: 4680,
    playersCount: 18900,
    trending: true,
    popular: true,
    featured: true,
    tags: ['Multiplayer', 'PvP', 'Arena', 'Action', 'Competitive', 'Premium'],
    engineType: 'canvas-space-shooter',
    instructions: [
      'Enter the neon holographic combat arena.',
      'Coordinate rapid offensive assaults and defensive shields.',
      'Accumulate arena kill streaks to earn the Grandmaster belt.'
    ],
    controls: [
      { key: 'W/A/S/D', action: 'Movement' },
      { key: 'Left Click', action: 'Primary Attack' },
      { key: 'Right Click', action: 'Deploy Barrier' },
      { key: 'Shift', action: 'Dash Escape' }
    ],
    releaseDate: '2026-08-30',
    developer: 'Arena Nexus'
  }
];

export const CATEGORIES_LIST: { id: Game['category']; title: string; count: number; icon: string; description: string }[] = [
  { id: 'Action', title: 'Action Games', count: 48, icon: 'Flame', description: 'Fast-paced combat, heroic showdowns, and reflex thrills' },
  { id: 'Racing', title: 'Racing Games', count: 32, icon: 'Gauge', description: 'High-speed circuits, drag racing, and nitro chases' },
  { id: 'Car', title: 'Car Games', count: 26, icon: 'Car', description: 'Supercars, drift challenges, and realistic driving' },
  { id: 'Shooting', title: 'Shooting Games', count: 38, icon: 'Crosshair', description: 'FPS tactical missions, space blasters, and target drills' },
  { id: 'Puzzle', title: 'Puzzle Games', count: 54, icon: 'Puzzle', description: 'Mind-bending logic riddles, 2048, and spatial challenges' },
  { id: 'Adventure', title: 'Adventure Games', count: 29, icon: 'Compass', description: 'Epic quests, atmospheric exploration, and mysteries' },
  { id: 'Arcade', title: 'Arcade Games', count: 62, icon: 'Gamepad2', description: 'Retro classics, high-score chasers, and brick breakers' },
  { id: 'Sports', title: 'Sports Games', count: 34, icon: 'Trophy', description: 'Championship tournaments, athletic cups, and leagues' },
  { id: 'Football', title: 'Football Games', count: 22, icon: 'CircleDot', description: 'Penalty shootouts, free kicks, and soccer cups' },
  { id: 'Basketball', title: 'Basketball Games', count: 18, icon: 'Dribbble', description: '3-point shootouts, slam dunks, and streetball hoops' },
  { id: 'Strategy', title: 'Strategy Games', count: 27, icon: 'Shield', description: 'Tower defense, tactical positioning, and grand plans' },
  { id: 'Multiplayer', title: 'Multiplayer Games', count: 31, icon: 'Users', description: 'Competitive 1v1 arenas, squad battles, and duels' },
  { id: 'Brain', title: 'Brain Games', count: 40, icon: 'Brain', description: 'Cognitive memory, IQ training, and math fusion' },
  { id: 'Casual', title: 'Casual Games', count: 58, icon: 'Coffee', description: 'Relaxing gameplay, quick breaks, and easy fun' },
  { id: '3D', title: '3D Games', count: 24, icon: 'Box', description: 'Immersive perspectives, depth physics, and 3D worlds' }
];
