// pokemon.js
// Base de données des Pokémon

const POKEMON_DB = {
  /*************************************************************
   * 1G – STARTERS CLASSIQUES
   *************************************************************/
  bulbasaur: {
    id: "bulbasaur",
    name: "Bulbizarre",
    types: ["grass", "poison"],
    baseStats: {
      hp: 45,
      attack: 49,
      defense: 49,
      spAttack: 65,
      spDefense: 65,
      speed: 45
    },
    spriteFront: "./assets/gif/pokemon/bulbasaur.gif",
    spriteBack: "./assets/gif/pokemon/bulbasaur-1.gif",
    moveIds: ["vine_whip", "razor_leaf", "sleep_powder", "sludge"]
  },
  charmander: {
    id: "charmander",
    name: "Salamèche",
    types: ["fire"],
    baseStats: {
      hp: 39,
      attack: 52,
      defense: 43,
      spAttack: 60,
      spDefense: 50,
      speed: 65
    },
    spriteFront: "./assets/gif/pokemon/charmander.gif",
    spriteBack: "./assets/gif/pokemon/charmander-1.gif",
    moveIds: ["scratch", "ember", "flamethrower", "dragon_claw"]
  },
  squirtle: {
    id: "squirtle",
    name: "Carapuce",
    types: ["water"],
    baseStats: {
      hp: 44,
      attack: 48,
      defense: 65,
      spAttack: 50,
      spDefense: 64,
      speed: 43
    },
    spriteFront: "./assets/gif/pokemon/squirtle.gif",
    spriteBack: "./assets/gif/pokemon/squirtle-1.gif",
    moveIds: ["tackle", "water_gun", "hydro_pump", "ice_beam"]
  },

  /*************************************************************
   * 1G – AUTRES
   *************************************************************/
  pikachu: {
    id: "pikachu",
    name: "Pikachu",
    types: ["electric"],
    baseStats: {
      hp: 35,
      attack: 55,
      defense: 40,
      spAttack: 50,
      spDefense: 50,
      speed: 90
    },
    spriteFront: "./assets/gif/pokemon/pikachu.gif",
    spriteBack: "./assets/gif/pokemon/pikachu-1.gif",
    moveIds: ["quick_attack", "thunder_shock", "thunderbolt", "iron_head"]
  },
  mr_mime: {
    id: "mr_mime",
    name: "M. Mime",
    types: ["psychic", "fairy"],
    baseStats: {
      hp: 40,
      attack: 45,
      defense: 65,
      spAttack: 100,
      spDefense: 120,
      speed: 90
    },
    spriteFront: "./assets/gif/pokemon/mr.mime.gif",
    spriteBack: "./assets/gif/pokemon/mr.mime-1.gif",
    moveIds: ["confusion", "psybeam", "shadow_ball", "thunder_wave"]
  },
  gengar: {
    id: "gengar",
    name: "Ectoplasma",
    types: ["ghost", "poison"],
    baseStats: {
      hp: 60,
      attack: 65,
      defense: 60,
      spAttack: 130,
      spDefense: 75,
      speed: 110
    },
    spriteFront: "./assets/gif/pokemon/gengar.gif",
    spriteBack: "./assets/gif/pokemon/gengar-1.gif",
    moveIds: ["shadow_ball", "sludge_bomb", "thunderbolt", "will_o_wisp"]
  },

  /*************************************************************
   * 2G / 4G – CIZAYOX, AUTRES FORTS
   *************************************************************/
  scizor: {
    id: "scizor",
    name: "Cizayox",
    types: ["bug", "steel"],
    baseStats: {
      hp: 70,
      attack: 130,
      defense: 100,
      spAttack: 55,
      spDefense: 80,
      speed: 65
    },
    spriteFront: "./assets/gif/pokemon/scizor.png",
    spriteBack: "./assets/gif/pokemon/scizor-1.gif",
    moveIds: ["bullet_punch", "iron_head", "u_turn", "knock_off"]
  },
  togekiss: {
    id: "togekiss",
    name: "Togekiss",
    types: ["fairy", "flying"],
    baseStats: {
      hp: 85,
      attack: 50,
      defense: 95,
      spAttack: 120,
      spDefense: 115,
      speed: 80
    },
    spriteFront: "./assets/gif/pokemon/togekiss.gif",
    spriteBack: "./assets/gif/pokemon/togekiss-1.gif",
    moveIds: ["air_slash", "play_rough", "flamethrower", "thunder_wave"]
  },

  /*************************************************************
   * 4G – GARCHOMP, ETC.
   *************************************************************/
  garchomp: {
    id: "garchomp",
    name: "Carchacrok",
    types: ["dragon", "ground"],
    baseStats: {
      hp: 108,
      attack: 130,
      defense: 95,
      spAttack: 80,
      spDefense: 85,
      speed: 102
    },
    spriteFront: "./assets/gif/pokemon/garchomp.gif",
    spriteBack: "./assets/gif/pokemon/garchomp-1.gif",
    moveIds: ["earthquake", "dragon_claw", "stone_edge", "flamethrower"]
  },
  excadrill: {
    id: "excadrill",
    name: "Minotaupe",
    types: ["ground", "steel"],
    baseStats: {
      hp: 110,
      attack: 135,
      defense: 60,
      spAttack: 50,
      spDefense: 65,
      speed: 88
    },
    spriteFront: "./assets/gif/pokemon/excadrill.gif",
    spriteBack: "./assets/gif/pokemon/excadrill-1.gif",
    moveIds: ["earthquake", "iron_head", "rock_throw", "toxic"]
  },

  /*************************************************************
   * 6G – AMPHINOBIE (GRENINJA)
   *************************************************************/
  amphinobie: {
    id: "amphinobie",
    name: "Amphinobi",
    types: ["water", "dark"],
    baseStats: {
      hp: 72,
      attack: 95,
      defense: 67,
      spAttack: 103,
      spDefense: 71,
      speed: 122
    },
    spriteFront: "./assets/gif/pokemon/greninja.gif",
    spriteBack: "./assets/gif/pokemon/greninja-1.gif",
    moveIds: ["water_gun", "hydro_pump", "ice_beam", "dark_pulse"]
  },

  /*************************************************************
   * 8G – STARTERS
   *************************************************************/
  cinderace: {
    id: "cinderace",
    name: "Pyrobut",
    types: ["fire"],
    baseStats: {
      hp: 80,
      attack: 116,
      defense: 75,
      spAttack: 65,
      spDefense: 75,
      speed: 119
    },
    spriteFront: "./assets/gif/pokemon/cinderace.gif",
    spriteBack: "./assets/gif/pokemon/cinderace.gif",
    moveIds: ["pyro_ball", "high_jump_kick", "u_turn", "quick_attack"]
  },
  rillaboom: {
    id: "rillaboom",
    name: "Gorythmic",
    types: ["grass"],
    baseStats: {
      hp: 100,
      attack: 125,
      defense: 90,
      spAttack: 60,
      spDefense: 70,
      speed: 85
    },
    spriteFront: "./assets/gif/pokemon/rillaboom.gif",
    spriteBack: "./assets/gif/pokemon/rillaboom.gif",
    moveIds: ["drum_beating", "earthquake", "knock_off", "toxic"]
  },
  inteleon: {
    id: "inteleon",
    name: "Lézargus",
    types: ["water"],
    baseStats: {
      hp: 70,
      attack: 85,
      defense: 65,
      spAttack: 125,
      spDefense: 65,
      speed: 120
    },
    spriteFront: "./assets/gif/pokemon/inteleon.gif",
    spriteBack: "./assets/gif/pokemon/inteleon.gif",
    moveIds: ["snipe_shot", "ice_beam", "shadow_ball", "toxic"]
  },

  /*************************************************************
   * 8G – GROSSES MENACES
   *************************************************************/
  dragapult: {
    id: "dragapult",
    name: "Lanssorien",
    types: ["dragon", "ghost"],
    baseStats: {
      hp: 88,
      attack: 120,
      defense: 75,
      spAttack: 100,
      spDefense: 75,
      speed: 142
    },
    spriteFront: "./assets/gif/pokemon/dragapult.gif",
    spriteBack: "./assets/gif/pokemon/dragapult.gif",
    moveIds: ["dragon_darts", "shadow_ball", "flamethrower", "thunderbolt"]
  },
  corviknight: {
    id: "corviknight",
    name: "Corvaillus",
    types: ["flying", "steel"],
    baseStats: {
      hp: 98,
      attack: 87,
      defense: 105,
      spAttack: 53,
      spDefense: 85,
      speed: 67
    },
    spriteFront: "./assets/gif/pokemon/corviknight.gif",
    spriteBack: "./assets/gif/pokemon/corviknight.gif",
    moveIds: ["brave_bird", "iron_head", "u_turn", "roost"]
  },
  toxtricity: {
    id: "toxtricity",
    name: "Salarsen",
    types: ["electric", "poison"],
    baseStats: {
      hp: 75,
      attack: 98,
      defense: 70,
      spAttack: 114,
      spDefense: 70,
      speed: 75
    },
    spriteFront: "./assets/gif/pokemon/toxtricity.gif",
    spriteBack: "./assets/gif/pokemon/toxtricity.gif",
    moveIds: ["overdrive", "sludge_bomb", "thunderbolt", "toxic"]
  },
  grimmsnarl: {
    id: "grimmsnarl",
    name: "Angoliath",
    types: ["dark", "fairy"],
    baseStats: {
      hp: 95,
      attack: 120,
      defense: 65,
      spAttack: 95,
      spDefense: 75,
      speed: 60
    },
    spriteFront: "./assets/gif/pokemon/grimmsnarl.gif",
    spriteBack: "./assets/gif/pokemon/grimmsnarl.gif",
    moveIds: ["play_rough", "darkest_lariat", "spirit_break", "thunder_wave"]
  },
    /*************************************************************
   * 7G – STARTERS ALOLA
   *************************************************************/
  decidueye: {
    id: "decidueye",
    name: "Archéduc",
    types: ["grass", "ghost"],
    baseStats: {
      hp: 78,
      attack: 107,
      defense: 75,
      spAttack: 100,
      spDefense: 100,
      speed: 70
    },
    spriteFront: "./assets/gif/pokemon/decidueye.gif",
    spriteBack: "./assets/gif/pokemon/decidueye-1.gif",
    moveIds: ["leaf_blade", "shadow_ball", "u_turn", "roost"]
  },
  incineroar: {
    id: "incineroar",
    name: "Félinferno",
    types: ["fire", "dark"],
    baseStats: {
      hp: 95,
      attack: 115,
      defense: 90,
      spAttack: 80,
      spDefense: 90,
      speed: 60
    },
    spriteFront: "./assets/gif/pokemon/incineroar.gif",
    spriteBack: "./assets/gif/pokemon/incineroar-1.gif",
    moveIds: ["flare_blitz", "darkest_lariat", "earthquake", "knock_off"]
  },
  primarina: {
    id: "primarina",
    name: "Oratoria",
    types: ["water", "fairy"],
    baseStats: {
      hp: 80,
      attack: 74,
      defense: 74,
      spAttack: 126,
      spDefense: 116,
      speed: 60
    },
    spriteFront: "./assets/gif/pokemon/primarina.gif",
    spriteBack: "./assets/gif/pokemon/primarina-1.gif",
    moveIds: ["scald", "moonblast", "ice_beam", "hydro_pump"]
  },

  /*************************************************************
   * 7G – POKÉMON DÉFENSIF : TOXAPEX
   *************************************************************/
  toxapex: {
    id: "toxapex",
    name: "Prédastérie",
    types: ["water", "poison"],
    baseStats: {
      hp: 50,
      attack: 63,
      defense: 152,
      spAttack: 53,
      spDefense: 142,
      speed: 35
    },
    spriteFront: "./assets/gif/pokemon/toxapex.gif",
    spriteBack: "./assets/gif/pokemon/toxapex-1.gif",
    moveIds: ["scald", "sludge_bomb", "toxic", "bite"]
  },

  /*************************************************************
   * 7G – TAPU KOKO
   *************************************************************/
  tapu_koko: {
    id: "tapu_koko",
    name: "Tokorico",
    types: ["electric", "fairy"],
    baseStats: {
      hp: 70,
      attack: 115,
      defense: 85,
      spAttack: 95,
      spDefense: 75,
      speed: 130
    },
    spriteFront: "./assets/gif/pokemon/tapukoko.gif",
    spriteBack: "./assets/gif/pokemon/tapukoko-1.gif",
    moveIds: ["thunderbolt", "dazzling_gleam", "u_turn", "brave_bird"]
  },

  /*************************************************************
   * 7G – KARTANA
   *************************************************************/
  kartana: {
    id: "kartana",
    name: "Katagami",
    types: ["grass", "steel"],
    baseStats: {
      hp: 59,
      attack: 181,
      defense: 131,
      spAttack: 59,
      spDefense: 31,
      speed: 109
    },
    spriteFront: "./assets/gif/pokemon/kartana.gif",
    spriteBack: "./assets/gif/pokemon/kartana-1.gif",
    moveIds: ["leaf_blade", "smart_strike", "sacred_sword", "knock_off"]
  }

};

const ALL_POKEMON_IDS = Object.keys(POKEMON_DB);
