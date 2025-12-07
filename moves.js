// moves.js
// Base de données des attaques

const MOVES_DB = {
  /*************************************************************
   * MOUVEMENTS PHYSIQUES DE BASE
   *************************************************************/
  tackle: {
    id: "tackle",
    name: "Charge",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 0
  },
  quick_attack: {
    id: "quick_attack",
    name: "Vive-Attaque",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 1
  },
  scratch: {
    id: "scratch",
    name: "Griffe",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 0
  },
  bite: {
    id: "bite",
    name: "Morsure",
    type: "dark",
    category: "physical",
    power: 60,
    accuracy: 100,
    priority: 0
  },

  /*************************************************************
   * MOUVEMENTS SPÉCIAUX / PHYSIQUES DE BASE PAR TYPE
   *************************************************************/
  ember: {
    id: "ember",
    name: "Flammèche",
    type: "fire",
    category: "special",
    power: 40,
    accuracy: 100,
    priority: 0,
    statusOnHit: "burn",
    statusChance: 0.1
  },
  water_gun: {
    id: "water_gun",
    name: "Pistolet à O",
    type: "water",
    category: "special",
    power: 40,
    accuracy: 100,
    priority: 0
  },
  vine_whip: {
    id: "vine_whip",
    name: "Fouet Lianes",
    type: "grass",
    category: "physical",
    power: 45,
    accuracy: 100,
    priority: 0
  },
  razor_leaf: {
    id: "razor_leaf",
    name: "Tranch'Herbe",
    type: "grass",
    category: "physical",
    power: 55,
    accuracy: 95,
    priority: 0
  },
  thunder_shock: {
    id: "thunder_shock",
    name: "Éclair",
    type: "electric",
    category: "special",
    power: 40,
    accuracy: 100,
    priority: 0,
    statusOnHit: "paralysis",
    statusChance: 0.1
  },
  gust: {
    id: "gust",
    name: "Tornade",
    type: "flying",
    category: "special",
    power: 40,
    accuracy: 100,
    priority: 0
  },

  /*************************************************************
   * MOUVEMENTS PHYSIQUES INTERMÉDIAIRES
   *************************************************************/
  wing_attack: {
    id: "wing_attack",
    name: "Cru-Aile",
    type: "flying",
    category: "physical",
    power: 60,
    accuracy: 100,
    priority: 0
  },
  low_kick: {
    id: "low_kick",
    name: "Balayage",
    type: "fighting",
    category: "physical",
    power: 50,
    accuracy: 100,
    priority: 0
  },
  karate_chop: {
    id: "karate_chop",
    name: "Poing Karaté",
    type: "fighting",
    category: "physical",
    power: 50,
    accuracy: 100,
    priority: 0
  },
  rock_throw: {
    id: "rock_throw",
    name: "Jet-Pierres",
    type: "rock",
    category: "physical",
    power: 50,
    accuracy: 90,
    priority: 0
  },

  /*************************************************************
   * MOUVEMENTS SPÉCIAUX INTERMÉDIAIRES
   *************************************************************/
  confusion: {
    id: "confusion",
    name: "Choc Mental",
    type: "psychic",
    category: "special",
    power: 50,
    accuracy: 100,
    priority: 0
  },
  psybeam: {
    id: "psybeam",
    name: "Rafale Psy",
    type: "psychic",
    category: "special",
    power: 65,
    accuracy: 100,
    priority: 0
  },
  sludge: {
    id: "sludge",
    name: "Détritus",
    type: "poison",
    category: "special",
    power: 65,
    accuracy: 100,
    priority: 0,
    statusOnHit: "poison",
    statusChance: 0.3
  },

  /*************************************************************
   * GROS MOVES SPÉCIAUX CLASSIQUES
   *************************************************************/
  flamethrower: {
    id: "flamethrower",
    name: "Lance-Flammes",
    type: "fire",
    category: "special",
    power: 90,
    accuracy: 100,
    priority: 0,
    statusOnHit: "burn",
    statusChance: 0.1
  },
  thunderbolt: {
    id: "thunderbolt",
    name: "Tonnerre",
    type: "electric",
    category: "special",
    power: 90,
    accuracy: 100,
    priority: 0,
    statusOnHit: "paralysis",
    statusChance: 0.1
  },
  ice_beam: {
    id: "ice_beam",
    name: "Laser Glace",
    type: "ice",
    category: "special",
    power: 90,
    accuracy: 100,
    priority: 0,
    statusOnHit: "freeze",
    statusChance: 0.1
  },
  shadow_ball: {
    id: "shadow_ball",
    name: "Ball'Ombre",
    type: "ghost",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  sludge_bomb: {
    id: "sludge_bomb",
    name: "Bomb-Beurk",
    type: "poison",
    category: "special",
    power: 90,
    accuracy: 100,
    priority: 0,
    statusOnHit: "poison",
    statusChance: 0.3
  },
  dark_pulse: {
    id: "dark_pulse",
    name: "Vibrobscur",
    type: "dark",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  hydro_pump: {
    id: "hydro_pump",
    name: "Hydrocanon",
    type: "water",
    category: "special",
    power: 110,
    accuracy: 80,
    priority: 0
  },

  /*************************************************************
   * GROS MOVES PHYSIQUES CLASSIQUES
   *************************************************************/
  earthquake: {
    id: "earthquake",
    name: "Séisme",
    type: "ground",
    category: "physical",
    power: 100,
    accuracy: 100,
    priority: 0
  },
  stone_edge: {
    id: "stone_edge",
    name: "Lame de Roc",
    type: "rock",
    category: "physical",
    power: 100,
    accuracy: 80,
    priority: 0
  },
  dragon_claw: {
    id: "dragon_claw",
    name: "Draco-Griffe",
    type: "dragon",
    category: "physical",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  play_rough: {
    id: "play_rough",
    name: "Câlinerie",
    type: "fairy",
    category: "physical",
    power: 90,
    accuracy: 90,
    priority: 0
  },

  /*************************************************************
   * MOUVEMENTS 8G / SIGNATURES
   *************************************************************/
  pyro_ball: {
    id: "pyro_ball",
    name: "Ballon Brûlant",
    type: "fire",
    category: "physical",
    power: 120,
    accuracy: 90,
    priority: 0,
    statusOnHit: "burn",
    statusChance: 0.2
  },
  drum_beating: {
    id: "drum_beating",
    name: "Tambour Battant",
    type: "grass",
    category: "physical",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  snipe_shot: {
    id: "snipe_shot",
    name: "Tir de Précision",
    type: "water",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  dragon_darts: {
    id: "dragon_darts",
    name: "Draco-Flèches",
    type: "dragon",
    category: "physical",
    power: 50, // traité comme un seul "hit" ici
    accuracy: 100,
    priority: 0
  },

  /*************************************************************
   * AUTRES MOVES UTILISÉS PAR LES POKÉMON 8G / META
   *************************************************************/
  air_slash: {
    id: "air_slash",
    name: "Lame d'Air",
    type: "flying",
    category: "special",
    power: 75,
    accuracy: 95,
    priority: 0
  },
  iron_head: {
    id: "iron_head",
    name: "Tête de Fer",
    type: "steel",
    category: "physical",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  u_turn: {
    id: "u_turn",
    name: "Demi-Tour",
    type: "bug",
    category: "physical",
    power: 70,
    accuracy: 100,
    priority: 0
    // pas d'effet de switch dans ce moteur
  },
  knock_off: {
    id: "knock_off",
    name: "Sabotage",
    type: "dark",
    category: "physical",
    power: 65,
    accuracy: 100,
    priority: 0
  },
  brave_bird: {
    id: "brave_bird",
    name: "Rapace",
    type: "flying",
    category: "physical",
    power: 120,
    accuracy: 100,
    priority: 0
    // pas de recul géré
  },
  overdrive: {
    id: "overdrive",
    name: "Overdrive",
    type: "electric",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0
  },
  darkest_lariat: {
    id: "darkest_lariat",
    name: "Dark Lariat",
    type: "dark",
    category: "physical",
    power: 85,
    accuracy: 100,
    priority: 0
  },
  spirit_break: {
    id: "spirit_break",
    name: "Choc Émotionnel",
    type: "fairy",
    category: "physical",
    power: 75,
    accuracy: 100,
    priority: 0
  },
  high_jump_kick: {
    id: "high_jump_kick",
    name: "Pied Voltige",
    type: "fighting",
    category: "physical",
    power: 130,
    accuracy: 90,
    priority: 0
  },
  bullet_punch: {
    id: "bullet_punch",
    name: "Pisto-Poing",
    type: "steel",
    category: "physical",
    power: 40,
    accuracy: 100,
    priority: 1
  },

  /*************************************************************
   * MOUVEMENTS DE STATUT / SUPPORT
   *************************************************************/
  will_o_wisp: {
    id: "will_o_wisp",
    name: "Feu Follet",
    type: "fire",
    category: "status",
    power: 0,
    accuracy: 85,
    priority: 0,
    status: "burn"
  },
  thunder_wave: {
    id: "thunder_wave",
    name: "Cage-Éclair",
    type: "electric",
    category: "status",
    power: 0,
    accuracy: 90,
    priority: 0,
    status: "paralysis"
  },
  toxic: {
    id: "toxic",
    name: "Toxik",
    type: "poison",
    category: "status",
    power: 0,
    accuracy: 90,
    priority: 0,
    status: "poison"
  },
  sleep_powder: {
    id: "sleep_powder",
    name: "Poudre Dodo",
    type: "grass",
    category: "status",
    power: 0,
    accuracy: 75,
    priority: 0,
    status: "sleep"
  },
  stun_spore: {
    id: "stun_spore",
    name: "Para-Spore",
    type: "grass",
    category: "status",
    power: 0,
    accuracy: 75,
    priority: 0,
    status: "paralysis"
  },
  roost: {
    id: "roost",
    name: "Atterrissage",
    type: "flying",
    category: "status",
    power: 0,
    accuracy: 100,
    priority: 0
    // le soin n'est pas encore géré dans le moteur
  },
    /*************************************************************
   * MOUVEMENTS 7G / NOUVEAUX POUR LES POKÉMON AJOUTÉS
   *************************************************************/
  scald: {
    id: "scald",
    name: "Ébullition",
    type: "water",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0,
    statusOnHit: "burn",
    statusChance: 0.3
  },
  moonblast: {
    id: "moonblast",
    name: "Pouvoir Lunaire",
    type: "fairy",
    category: "special",
    power: 95,
    accuracy: 100,
    priority: 0
  },
  leaf_blade: {
    id: "leaf_blade",
    name: "Lame-Feuille",
    type: "grass",
    category: "physical",
    power: 90,
    accuracy: 100,
    priority: 0
  },
  flare_blitz: {
    id: "flare_blitz",
    name: "Boutefeu",
    type: "fire",
    category: "physical",
    power: 120,
    accuracy: 100,
    priority: 0
    // pas de dégâts de recul dans ce moteur
  },
  sacred_sword: {
    id: "sacred_sword",
    name: "Lame Sainte",
    type: "fighting",
    category: "physical",
    power: 90,
    accuracy: 100,
    priority: 0
  },
  smart_strike: {
    id: "smart_strike",
    name: "Estocorne",
    type: "steel",
    category: "physical",
    power: 70,
    accuracy: 100,
    priority: 0
  },
  dazzling_gleam: {
    id: "dazzling_gleam",
    name: "Éclat Magique",
    type: "fairy",
    category: "special",
    power: 80,
    accuracy: 100,
    priority: 0
  },
    volt_switch: {
    id: "volt_switch",
    name: "Change Éclair",
    type: "electric",
    category: "special",
    power: 70,
    accuracy: 100,
    priority: 0
  }

};
