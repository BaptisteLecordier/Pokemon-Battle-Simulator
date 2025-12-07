// types.js
const TYPE_CHART = {
  normal:  { id:"normal",  name:"Normal",   weakTo:["fighting"], resistantTo:[], immuneTo:["ghost"] },
  fire:    { id:"fire",    name:"Feu",      weakTo:["water","ground","rock"], resistantTo:["fire","grass","ice","bug","steel","fairy"], immuneTo:[] },
  water:   { id:"water",   name:"Eau",      weakTo:["electric","grass"], resistantTo:["fire","water","ice","steel"], immuneTo:[] },
  grass:   { id:"grass",   name:"Plante",   weakTo:["fire","ice","poison","flying","bug"], resistantTo:["water","grass","electric","ground"], immuneTo:[] },
  electric:{ id:"electric",name:"Électrik", weakTo:["ground"], resistantTo:["electric","flying","steel"], immuneTo:[] },
  ice:     { id:"ice",     name:"Glace",    weakTo:["fire","fighting","rock","steel"], resistantTo:["ice"], immuneTo:[] },
  fighting:{ id:"fighting",name:"Combat",   weakTo:["flying","psychic","fairy"], resistantTo:["bug","rock","dark"], immuneTo:[] },
  poison:  { id:"poison",  name:"Poison",   weakTo:["ground","psychic"], resistantTo:["grass","fighting","poison","bug","fairy"], immuneTo:[] },
  ground:  { id:"ground",  name:"Sol",      weakTo:["water","grass","ice"], resistantTo:["poison","rock"], immuneTo:["electric"] },
  flying:  { id:"flying",  name:"Vol",      weakTo:["electric","ice","rock"], resistantTo:["grass","fighting","bug"], immuneTo:["ground"] },
  psychic: { id:"psychic", name:"Psy",      weakTo:["bug","ghost","dark"], resistantTo:["fighting","psychic"], immuneTo:[] },
  bug:     { id:"bug",     name:"Insecte",  weakTo:["fire","flying","rock"], resistantTo:["grass","fighting","ground"], immuneTo:[] },
  rock:    { id:"rock",    name:"Roche",    weakTo:["water","grass","fighting","ground","steel"], resistantTo:["normal","fire","poison","flying"], immuneTo:[] },
  ghost:   { id:"ghost",   name:"Spectre",  weakTo:["ghost","dark"], resistantTo:["poison","bug"], immuneTo:["normal","fighting"] },
  dragon:  { id:"dragon",  name:"Dragon",   weakTo:["ice","dragon","fairy"], resistantTo:["fire","water","grass","electric"], immuneTo:[] },
  dark:    { id:"dark",    name:"Ténèbres", weakTo:["fighting","bug","fairy"], resistantTo:["ghost","dark"], immuneTo:["psychic"] },
  steel:   { id:"steel",   name:"Acier",    weakTo:["fire","fighting","ground"], resistantTo:["normal","grass","ice","flying","psychic","bug","rock","dragon","steel","fairy"], immuneTo:["poison"] },
  fairy:   { id:"fairy",   name:"Fée",      weakTo:["poison","steel"], resistantTo:["fighting","bug","dark"], immuneTo:["dragon"] }
};
