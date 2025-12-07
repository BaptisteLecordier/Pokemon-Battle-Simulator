// statuses.js

const STATUS_DB = {
  burn: {
    id: "burn",
    name: "Brûlure",
    short: "BRU",
    description: "Attaque physique réduite, perd des PV à chaque tour.",
    damageFraction: 1 / 16,
    attackModifier: 0.5
  },
  paralysis: {
    id: "paralysis",
    name: "Paralysie",
    short: "PAR",
    description: "Vitesse réduite, a une chance de ne pas attaquer.",
    speedModifier: 0.5,
    immobilizeChance: 0.25
  },
  sleep: {
    id: "sleep",
    name: "Sommeil",
    short: "SLP",
    description: "Ne peut pas attaquer pendant quelques tours."
  },
  poison: {
    id: "poison",
    name: "Poison",
    short: "PSN",
    description: "Perd des PV à chaque tour.",
    damageFraction: 1 / 8,
    spAttackModifier: 0.5 
  },
  freeze: {
    id: "freeze",
    name: "Gel",
    short: "GEL",
    description: "Ne peut pas attaquer, peut se dégeler progressivement.",
    thawChance: 0.2
  }
};
