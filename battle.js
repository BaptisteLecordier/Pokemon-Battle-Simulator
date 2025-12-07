/*************************************************************
 * UTILITAIRES GÉNÉRAUX
 *************************************************************/
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// "easy" | "medium" | "hard"
let difficulty = "medium";

/*************************************************************
 * CLASSES DE BASE
 *************************************************************/
class Move {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.category = data.category;   // "physical" | "special" | "status"
    this.power = data.power;
    this.accuracy = data.accuracy ?? 100;
    this.priority = data.priority ?? 0;
    this.status = data.status || null;           // statut pur
    this.statusOnHit = data.statusOnHit || null; // statut sur coup porté
    this.statusChance = data.statusChance ?? 0;
  }
}

class Pokemon {
  constructor(template) {
    this.id = template.id;
    this.name = template.name;
    this.types = [...template.types];
    this.maxHP = template.baseStats.hp;
    this.stats = { ...template.baseStats };
    this.currentHP = this.maxHP;
    this.spriteFront = template.spriteFront;
    this.spriteBack = template.spriteBack;

    this.moves = template.moveIds
      .map(id => {
        const data = MOVES_DB[id];
        if (!data) {
          console.error("Attaque inconnue dans MOVES_DB :", id, "pour le Pokémon", template.id);
          return null;
        }
        return new Move(data);
      })
      .filter(m => m);

    this.status = null;      // id du statut (burn, paralysis, sleep, poison, freeze)
    this.statusTurns = 0;    // utile pour le sommeil
    this._roleScore = 0;     // importance stratégique en mode hard
    this.grounded = false;   // pour Roost : enlève l'immunité Sol pendant le tour
  }

  isFainted() {
    return this.currentHP <= 0;
  }
}

class Team {
  constructor(ids) {
    this.pokemons = [];
    ids.forEach(id => {
      const tpl = POKEMON_DB[id];
      if (!tpl) {
        console.error("Pokémon inconnu dans POKEMON_DB :", id);
        return;
      }
      this.pokemons.push(new Pokemon(tpl));
    });
    this.activeIndex = 0;
  }
  get active() { return this.pokemons[this.activeIndex]; }
  hasRemaining() { return this.pokemons.some(p => !p.isFainted()); }
  switchTo(i) {
    if (this.pokemons[i].isFainted()) return false;
    this.activeIndex = i;
    return true;
  }
  getFirstAliveIndex() { return this.pokemons.findIndex(p => !p.isFainted()); }
  remainingCount() { return this.pokemons.filter(p => !p.isFainted()).length; }
}

/*************************************************************
 * TYPES & DÉGÂTS
 *************************************************************/
function typeModifier(moveType, defenderTypes) {
  let mod = 1;
  defenderTypes.forEach(t => {
    const chart = TYPE_CHART[t];
    if (!chart) return;
    if (chart.weakTo.includes(moveType)) mod *= 2;
    if (chart.resistantTo.includes(moveType)) mod *= 0.5;
    if (chart.immuneTo.includes(moveType)) mod *= 0;
  });
  return mod;
}

function effectiveSpeed(mon) {
  let s = mon.stats.speed;
  if (mon.status === "paralysis") {
    const st = STATUS_DB.paralysis;
    s = Math.floor(s * (st.speedModifier ?? 0.5));
  }
  return s;
}

function calculateDamage(attacker, defender, move) {
  if (move.category === "status") return 0;

  let A = move.category === "physical" ? attacker.stats.attack : attacker.stats.spAttack;
  const D = move.category === "physical" ? defender.stats.defense : defender.stats.spDefense;

  // Brûlure : réduit l'attaque physique
  if (move.category === "physical" && attacker.status === "burn") {
    const st = STATUS_DB.burn;
    A = Math.floor(A * (st.attackModifier ?? 0.5));
  }

  // Poison : réduit l'attaque spéciale
  if (move.category === "special" && attacker.status === "poison") {
    const st = STATUS_DB.poison;
    if (st.spAttackModifier) {
      A = Math.floor(A * st.spAttackModifier);
    }
  }

  const base = ((2 * 50 / 5 + 2) * move.power * (A / D)) / 50 + 2;
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Modificateur de type standard
  let mod = typeModifier(move.type, defender.types);

  // Cas spécial : Roost (Atterrissage) enlève l'immunité Sol ce tour
  if (move.type === "ground" && defender.grounded) {
    const effectiveTypes = defender.types.filter(t => t !== "flying");
    mod = typeModifier(move.type, effectiveTypes);
  }

  const dmg = Math.floor(base * stab * mod);
  return Math.max(1, dmg);
}

/*************************************************************
 * ÉVALUATION / DIFFICULTÉ / TEAM BUILDING
 *************************************************************/
function statTotal(template) {
  const bs = template.baseStats;
  return bs.hp + bs.attack + bs.defense + bs.spAttack + bs.spDefense + bs.speed;
}

function offensiveCoverageScore(template) {
  const allTypes = Object.keys(TYPE_CHART);
  const covered = new Set();

  template.moveIds.forEach(mid => {
    const m = MOVES_DB[mid];
    if (!m || m.category === "status" || !m.power) return;
    const moveType = m.type;
    allTypes.forEach(defType => {
      const chart = TYPE_CHART[defType];
      if (!chart) return;
      if (chart.weakTo.includes(moveType)) {
        covered.add(defType);
      }
    });
  });

  return covered.size;
}

function weaknessCount(template) {
  const allTypes = Object.keys(TYPE_CHART);
  const weakSet = new Set();
  allTypes.forEach(atkType => {
    const mult = typeModifier(atkType, template.types);
    if (mult > 1) weakSet.add(atkType);
  });
  return weakSet.size;
}

function ratePokemonForDifficulty(template) {
  const total = statTotal(template);
  const offCov = offensiveCoverageScore(template);
  const weak = weaknessCount(template);
  return total + offCov * 8 - weak * 5;
}

/*************************************************************
 * MOTEUR DE COMBAT
 *************************************************************/
class BattleEngine {
  constructor(playerTeam, aiTeam) {
    this.playerTeam = playerTeam;
    this.aiTeam = aiTeam;
    this.gameOver = false;
    this.playerMustSwitch = false;
    this.isResolving = false;
    this.delay = 700;

    // Gestion d'un tour "en pause" (U-Turn / Volt Switch joueur)
    this.currentTurnSecond = null; // { side, action }
    this.pendingTurn = null;       // tour à reprendre après choix du switch

    if (difficulty === "hard") {
      this.buildHardKnowledge();
    }
  }

  buildHardKnowledge() {
    const playerMons = this.playerTeam.pokemons;
    this.aiTeam.pokemons.forEach(mon => {
      let roleScore = 0;

      playerMons.forEach(pMon => {
        let bestMult = 0;
        mon.moves.forEach(m => {
          if (m.category === "status" || !m.power) return;
          const mult = typeModifier(m.type, pMon.types);
          if (mult > bestMult) bestMult = mult;
        });
        if (bestMult > 1) roleScore += 4 * bestMult;
        else if (bestMult === 1) roleScore += 1;

        pMon.types.forEach(stabType => {
          const mult = typeModifier(stabType, mon.types);
          if (mult < 1) roleScore += 2;
          else if (mult > 1) roleScore -= 2 * mult;
        });
      });

      mon._roleScore = roleScore;
    });
  }

  bestMod(attacker, defender) {
    let best = 1;
    for (const m of attacker.moves) {
      if (m.category === "status") continue;
      const v = typeModifier(m.type, defender.types);
      if (v > best) best = v;
    }
    return best;
  }

  estimateBestDamage(attacker, defender) {
    let best = 0;
    for (const m of attacker.moves) {
      if (m.category === "status" || !m.power) continue;
      const dmg = calculateDamage(attacker, defender, m);
      if (dmg > best) best = dmg;
    }
    return best;
  }

  getDiffSettings() {
    switch (difficulty) {
      case "easy":
        return {
          randomMoveChance: 0.25,
          strongSwitchBias: 0.35,
          moderateSwitchBias: 0.15,
          sacrificeStayChance: 0.8,
          forceAttackOverSwitchChance: 0.4,
          topMoveChoice: 0.45,
          topNMoves: 3,
          priorityWhenDying: 0.5,
          statusBias: 0.6
        };
      case "hard":
        return {
          randomMoveChance: 0.01,
          strongSwitchBias: 0.98,
          moderateSwitchBias: 0.85,
          sacrificeStayChance: 0.15,
          forceAttackOverSwitchChance: 0.02,
          topMoveChoice: 0.95,
          topNMoves: 2,
          priorityWhenDying: 0.95,
          statusBias: 1.4
        };
      default: // medium
        return {
          randomMoveChance: 0.08,
          strongSwitchBias: 0.8,
          moderateSwitchBias: 0.45,
          sacrificeStayChance: 0.5,
          forceAttackOverSwitchChance: 0.1,
          topMoveChoice: 0.7,
          topNMoves: 2,
          priorityWhenDying: 0.7,
          statusBias: 1.0
        };
    }
  }

  aiDecideAction(playerMon) {
    const active = this.aiTeam.active;
    const diff = this.getDiffSettings();

    // 1) Petit pourcentage de moves complètement random,
    //    mais en évitant si possible les immunités.
    if (Math.random() < diff.randomMoveChance && active.moves.length > 0) {
      const nonImmune = active.moves.filter(m => {
        const mod = typeModifier(m.type, playerMon.types);
        if (m.category === "status") return mod !== 0;
        return mod !== 0;
      });
      const pool = nonImmune.length > 0 ? nonImmune : active.moves;
      const randomMove = pool[randInt(0, pool.length - 1)];
      return { type: "move", move: randomMove };
    }

    const activeMod = this.bestMod(active, playerMon);
    const oppMod = this.bestMod(playerMon, active);
    const activeRole = active._roleScore || 0;
    const lowHP = active.currentHP / active.maxHP < 0.25;
    const slower = effectiveSpeed(active) < effectiveSpeed(playerMon);
    const incomingOnActive = this.estimateBestDamage(playerMon, active);
    const willActiveDie = incomingOnActive >= active.currentHP;
    const riskyToStay = oppMod > 1 && slower;

    /***********************************************************
     * ÉVALUATION DES CANDIDATS DE SWITCH
     ***********************************************************/
    const bench = [];
    this.aiTeam.pokemons.forEach((mon, idx) => {
      if (idx === this.aiTeam.activeIndex || mon.isFainted()) return;

      const offensiveMod = this.bestMod(mon, playerMon);
      const incomingOnMon = this.estimateBestDamage(playerMon, mon);
      const willMonDie = incomingOnMon >= mon.currentHP;
      const role = mon._roleScore || 0;

      let score = 0;
      score += offensiveMod * 4;

      const dmgRatio = incomingOnMon / mon.maxHP;
      score -= dmgRatio * 6;

      score += role / 40;

      if (willMonDie && role >= activeRole - 5) {
        score -= 20;
      }

      bench.push({
        idx,
        mon,
        score,
        offensiveMod,
        incomingOnMon,
        willMonDie,
        role
      });
    });

    bench.sort((a, b) => b.score - a.score);
    const best = bench[0];

    /***********************************************************
     * DÉCISION DE SWITCH OU NON
     ***********************************************************/
    let preferSwitch = false;

    if (best) {
      const advantageGain = best.offensiveMod - activeMod;
      const saferThanStaying = best.incomingOnMon < incomingOnActive - active.maxHP * 0.1;

      const candidateClearlyBad =
        best.willMonDie &&
        (best.role >= activeRole - 5 || difficulty === "hard");

      if (!candidateClearlyBad) {
        if (advantageGain > 1.5 && saferThanStaying) {
          if (Math.random() < diff.strongSwitchBias) preferSwitch = true;
        } else if (advantageGain > 0.5 && saferThanStaying) {
          if (Math.random() < diff.moderateSwitchBias) preferSwitch = true;
        }
      }
    }

    let sacrificeStayChance = diff.sacrificeStayChance;
    if (difficulty === "hard") {
      if (activeRole <= 0) {
        sacrificeStayChance = 0.95;
      } else if (activeRole > 25) {
        sacrificeStayChance = 0.1;
      } else if (activeRole > 15) {
        sacrificeStayChance *= 0.5;
      }
    }

    if (lowHP && riskyToStay && willActiveDie) {
      if (Math.random() < sacrificeStayChance) {
        preferSwitch = false;
      }
    }

    if (preferSwitch && Math.random() < diff.forceAttackOverSwitchChance) {
      preferSwitch = false;
    }

    // 🔥 ICI : l'IA essaye d'abord d'utiliser un move pivot (U-Turn / Volt Switch)
    if (preferSwitch) {
      const pivotMoves = active.moves.filter(
        m => m.id === "u_turn" || m.id === "volt_switch"
      );
      let chosenPivot = null;
      for (const m of pivotMoves) {
        const mod = typeModifier(m.type, playerMon.types);
        if (mod !== 0) { // pas d'immunité (Change Éclair ne sera pas utilisé vs Sol)
          chosenPivot = m;
          break;
        }
      }

      if (chosenPivot) {
        return { type: "move", move: chosenPivot };
      }

      if (best) {
        return { type: "switch", toIndex: best.idx };
      }
    }

    /***********************************************************
     * PRIORITÉS SI ON VA MOURIR AU PROCHAIN COUP
     ***********************************************************/
    if (willActiveDie) {
      const priorityMoves = active.moves.filter(
        m => m.priority > 0 && m.category !== "status"
      );
      if (priorityMoves.length > 0 && Math.random() < diff.priorityWhenDying) {
        let bestM = null;
        let bestScore = -Infinity;
        priorityMoves.forEach(m => {
          const mod = typeModifier(m.type, playerMon.types);
          if (mod === 0) return;
          const dmg = calculateDamage(active, playerMon, m);
          let score = dmg;
          if (dmg >= playerMon.currentHP) score += 50;
          if (score > bestScore) {
            bestScore = score;
            bestM = m;
          }
        });
        if (bestM) {
          return { type: "move", move: bestM };
        }
      }
    }

    /***********************************************************
     * CHOIX DU MEILLEUR MOVE (DÉGÂTS + STATUT)
     ***********************************************************/
    const scored = [];
    for (const m of active.moves) {
      let score = 0;
      const mod = typeModifier(m.type, playerMon.types);

      if (m.category === "status") {
        if (mod === 0) {
          score = -9999;
        } else {
          let baseStatus = (!playerMon.status && m.status) ? 45 : 8;
          baseStatus *= diff.statusBias;
          score = baseStatus;
        }
      } else {
        if (mod === 0) {
          score = -9999;
        } else {
          const base = (m.power || 0) * mod;
          score = base;

          if (m.statusOnHit && m.statusChance > 0 && !playerMon.status) {
            score += 15 * m.statusChance;
          }
        }
      }

      const noise = 0.9 + Math.random() * 0.3;
      score *= noise;

      scored.push({ move: m, score });
    }

    const nonTerrible = scored.filter(s => s.score > -9999);
    const list = nonTerrible.length > 0 ? nonTerrible : scored;

    if (list.length === 0) {
      return { type: "move", move: active.moves[0] };
    }

    list.sort((a, b) => b.score - a.score);

    let chosen;
    if (Math.random() < diff.topMoveChoice || list.length === 1) {
      chosen = list[0].move;
    } else {
      const topN = Math.min(diff.topNMoves, list.length);
      const idx = randInt(0, topN - 1);
      chosen = list[idx].move;
    }

    return { type:"move", move: chosen };
  }

  getActionMeta(side, action) {
    const team = side === "player" ? this.playerTeam : this.aiTeam;
    const mon = team.active;
    if (action.type === "switch") {
      return { priority: 6, speed: effectiveSpeed(mon) };
    }
    if (action.type === "move") {
      return {
        priority: action.move.priority ?? 0,
        speed: effectiveSpeed(mon)
      };
    }
    return { priority: 0, speed: effectiveSpeed(mon) };
  }

  async doTurn(playerAction) {
    if (this.gameOver || this.isResolving) return;
    if (this.playerMustSwitch) {
      logMessage("Votre Pokémon est K.O. Choisissez un remplaçant.");
      return;
    }

    // Effet "grounded" de Roost ne dure qu'un tour
    this.playerTeam.pokemons.forEach(p => p.grounded = false);
    this.aiTeam.pokemons.forEach(p => p.grounded = false);

    this.isResolving = true;

    const pMon = this.playerTeam.active;
    const aMon = this.aiTeam.active;
    const aiAction = this.aiDecideAction(pMon);

    const pMeta = this.getActionMeta("player", playerAction);
    const aMeta = this.getActionMeta("ai", aiAction);

    let firstSide = "player";
    let firstAct  = playerAction;
    let secondSide = "ai";
    let secondAct  = aiAction;

    if (pMeta.priority > aMeta.priority) {
      firstSide = "player"; firstAct = playerAction;
      secondSide = "ai";    secondAct = aiAction;
    } else if (pMeta.priority < aMeta.priority) {
      firstSide = "ai";     firstAct = aiAction;
      secondSide = "player";secondAct = playerAction;
    } else {
      if (pMeta.speed > aMeta.speed) {
        firstSide = "player"; firstAct = playerAction;
        secondSide = "ai";    secondAct = aiAction;
      } else if (pMeta.speed < aMeta.speed) {
        firstSide = "ai";     firstAct = aiAction;
        secondSide = "player";secondAct = playerAction;
      } else {
        if (Math.random() < 0.5) {
          firstSide = "player"; firstAct = playerAction;
          secondSide = "ai";    secondAct = aiAction;
        } else {
          firstSide = "ai";     firstAct = aiAction;
          secondSide = "player";secondAct = playerAction;
        }
      }
    }

    // on enregistre l'action du second attaquant pour un éventuel tour "en pause"
    this.currentTurnSecond = { side: secondSide, action: secondAct };

    // On joue le premier
    await this.performWithDelay(firstSide, firstAct);

    // Si le premier était un U-Turn / Volt Switch du joueur, on a mis pendingTurn
    if (this.pendingTurn) {
      // La suite du tour sera jouée après le choix du switch
      return;
    }

    // Sinon, déroulement normal du 2e attaquant
    if (
      !this.gameOver &&
      !this.playerTeam.active.isFainted() &&
      !this.aiTeam.active.isFainted()
    ) {
      await this.performWithDelay(secondSide, secondAct);
    }

    this.applyEndOfTurnStatusDamage();
    this.resolveKO();
    this.isResolving = false;
  }

  async resumePendingTurn() {
    if (!this.pendingTurn) return;

    const { side, action } = this.pendingTurn;
    this.pendingTurn = null;

    if (
      !this.gameOver &&
      !this.playerTeam.active.isFainted() &&
      !this.aiTeam.active.isFainted()
    ) {
      await this.performWithDelay(side, action);
    }

    this.applyEndOfTurnStatusDamage();
    this.resolveKO();
    this.isResolving = false;
  }

  performAction(side, action) {
    const selfTeam = side === "player" ? this.playerTeam : this.aiTeam;
    const oppTeam  = side === "player" ? this.aiTeam     : this.playerTeam;
    const actor = selfTeam.active;
    const target = oppTeam.active;

    if (actor.isFainted()) return;

    if (action.type === "switch") {
      selfTeam.switchTo(action.toIndex);
      animateEntry(side);
      logMessage(`${side === "player" ? "Vous" : "L'adversaire"} envoyez ${selfTeam.active.name}.`);
      return;
    }

    if (action.type === "move") {
      const move = action.move;

      if (!canActThisTurn(actor)) {
        return;
      }

      // Précision
      if (move.accuracy < 100) {
        const roll = Math.random() * 100;
        if (roll > move.accuracy) {
          logMessage(`${actor.name} rate son attaque !`);
          return;
        }
      }

      // Attaque de statut pure
      if (move.category === "status") {

        // Cas spécial : Atterrissage (Roost)
        if (move.id === "roost") {
          const oldHP = actor.currentHP;
          const heal = Math.floor(actor.maxHP / 2);
          actor.currentHP = Math.min(actor.maxHP, actor.currentHP + heal);
          actor.grounded = true; // enlève l'immunité Sol jusqu'à la fin du tour

          const gained = actor.currentHP - oldHP;
          logMessage(`${actor.name} utilise ${move.name} et récupère ${gained} PV !`);
          return;
        }

        const mod = typeModifier(move.type, target.types);
        if (mod === 0) {
          logMessage(`Cela n'a aucun effet sur ${target.name} !`);
          return;
        }
        if (move.status && !target.status) {
          applyStatus(target, move.status);
        } else if (move.status && target.status) {
          logMessage(`${target.name} a déjà un statut.`);
        } else {
          logMessage(`${actor.name} utilise ${move.name}.`);
        }
        return;
      }

      // Attaque de dégâts
      animateAttack(side);

      const dmg = calculateDamage(actor, target, move);
      let mod = typeModifier(move.type, target.types);
      if (move.type === "ground" && target.grounded) {
        const effectiveTypes = target.types.filter(t => t !== "flying");
        mod = typeModifier(move.type, effectiveTypes);
      }

      if (mod === 0) {
        logMessage(`${actor.name} utilise ${move.name}, mais cela n'a aucun effet !`);
        return;
      }

      target.currentHP = Math.max(0, target.currentHP - dmg);

      let msg = `${actor.name} utilise ${move.name} ! `;
      if (mod > 1) msg += "C'est super efficace !";
      else if (mod < 1) msg += "Ce n'est pas très efficace…";
      msg += ` (-${dmg} PV)`;
      logMessage(msg);

      // Statut éventuel sur coup réussi
      if (target.currentHP > 0 && move.statusOnHit && move.statusChance > 0 && !target.status) {
        const roll = Math.random();
        if (roll < move.statusChance) {
          applyStatus(target, move.statusOnHit);
        }
      }

      if (target.currentHP <= 0) {
        target.currentHP = 0;
        setTimeout(() => {
          animateFaint(side === "player" ? "ai" : "player");
          logMessage(`${target.name} est K.O. !`);
        }, 220);
      }

      /***********************************************************
       * DEMI-TOUR (U-TURN) & VOLT SWITCH : SWITCH FORCÉ
       ***********************************************************/
      if ((move.id === "u_turn" || move.id === "volt_switch") && !actor.isFainted()) {
        const team = side === "player" ? this.playerTeam : this.aiTeam;

        const candidates = team.pokemons
          .map((m, idx) => ({ m, idx }))
          .filter(o => !o.m.isFainted() && o.idx !== team.activeIndex);

        if (candidates.length > 0) {
          if (side === "ai") {
            // IA : choisit un Pokémon au hasard parmi ceux disponibles
            const r = randInt(0, candidates.length - 1);
            const chosenIdx = candidates[r].idx;
            logMessage(`L'adversaire rappelle ${actor.name} !`);
            team.switchTo(chosenIdx);
            animateEntry("ai");
            logMessage(`L'adversaire envoie ${team.active.name}.`);
          } else {
            // JOUEUR : on ouvre un popup FORCÉ, puis on reprend le tour
            const pendingSecond = this.currentTurnSecond;
            this.pendingTurn = pendingSecond;

            buildSwitchPopup(true, (idx) => {
              switchPopup.classList.add("hidden");
              const oldName = actor.name;
              team.switchTo(idx);
              animateEntry("player");
              updateUI();
              logMessage(`Vous rappelez ${oldName} !`);
              logMessage(`Vous envoyez ${team.active.name}.`);

              this.resumePendingTurn();
            });
          }
        }
      }
    }
  }

  async performWithDelay(side, action) {
    this.performAction(side, action);
    updateUI();
    await waitMs(this.delay);
  }

  applyEndOfTurnStatusDamage() {
    const applyFor = (mon) => {
      if (mon.isFainted() || !mon.status) return;
      const st = STATUS_DB[mon.status];
      if (!st || !st.damageFraction) return;

      const dmg = Math.max(1, Math.floor(mon.maxHP * st.damageFraction));
      mon.currentHP = Math.max(0, mon.currentHP - dmg);
      logMessage(`${mon.name} souffre de ${st.name} (-${dmg} PV).`);

      if (mon.currentHP <= 0) {
        mon.currentHP = 0;
      }
    };

    applyFor(this.playerTeam.active);
    applyFor(this.aiTeam.active);
    updateUI();
  }

  resolveKO() {
    if (!this.playerTeam.hasRemaining()) {
      this.gameOver = true;
      endBattle("ai");
      return;
    }
    if (!this.aiTeam.hasRemaining()) {
      this.gameOver = true;
      endBattle("player");
      return;
    }

    if (this.playerTeam.active.isFainted()) {
      this.playerMustSwitch = true;
      openForcedSwitchMenu();
    }

    if (this.aiTeam.active.isFainted()) {
      const idx = this.aiTeam.getFirstAliveIndex();
      this.aiTeam.switchTo(idx);
      animateEntry("ai");
      logMessage(`L'adversaire envoie ${this.aiTeam.active.name}.`);
    }

    updateUI();
  }
}

/*************************************************************
 * STATUTS – LOGIQUE
 *************************************************************/
function applyStatus(mon, statusId) {
  const st = STATUS_DB[statusId];
  if (!st) return;
  if (mon.status === statusId) return;
  if (mon.status) {
    logMessage(`${mon.name} a déjà un statut.`);
    return;
  }

  mon.status = statusId;
  if (statusId === "sleep") {
    mon.statusTurns = randInt(1, 3);
  } else {
    mon.statusTurns = 0;
  }

  logMessage(`${mon.name} est affecté par ${st.name} !`);
}

function canActThisTurn(mon) {
  if (!mon.status) return true;

  const st = STATUS_DB[mon.status];
  if (!st) return true;

  if (mon.status === "paralysis") {
    const roll = Math.random();
    if (roll < (st.immobilizeChance ?? 0.25)) {
      logMessage(`${mon.name} est paralysé ! Il ne peut pas attaquer !`);
      return false;
    }
    return true;
  }

  if (mon.status === "sleep") {
    if (mon.statusTurns > 0) {
      logMessage(`${mon.name} dort profondément...`);
      mon.statusTurns -= 1;
      if (mon.statusTurns === 0) {
        mon.status = null;
        logMessage(`${mon.name} se réveille !`);
      }
      return false;
    }
    mon.status = null;
    logMessage(`${mon.name} se réveille !`);
    return true;
  }

  if (mon.status === "freeze") {
    const chance = st.thawChance ?? 0.2;
    const roll = Math.random();
    if (roll < chance) {
      mon.status = null;
      logMessage(`${mon.name} se dégèle !`);
      return true;
    } else {
      logMessage(`${mon.name} est gelé et ne peut pas attaquer !`);
      return false;
    }
  }

  return true;
}

/*************************************************************
 * ANIMATIONS DES SPRITES
 *************************************************************/
function triggerAnimation(el, klass, dur) {
  if (!el) return;
  el.classList.remove(klass);
  void el.offsetWidth;
  el.classList.add(klass);
  setTimeout(() => el.classList.remove(klass), dur);
}

function animateEntry(side) {
  const img = document.getElementById(side === "player" ? "player-sprite" : "ai-sprite");
  if (!img) return;
  img.style.opacity = "1";
  triggerAnimation(img, "entry-animation", 400);
}

function animateAttack(side) {
  const img = document.getElementById(side === "player" ? "player-sprite" : "ai-sprite");
  if (!img) return;
  const cls = side === "player" ? "attack-player" : "attack-ai";
  triggerAnimation(img, cls, 300);
}

function animateFaint(side) {
  const img = document.getElementById(side === "player" ? "player-sprite" : "ai-sprite");
  if (!img) return;
  triggerAnimation(img, "faint-animation", 450);
  setTimeout(() => {
    img.style.opacity = "0";
  }, 450);
}

/*************************************************************
 * DOM / RÉFÉRENCES UI
 *************************************************************/
let engine;
let playerTeam;
let aiTeam;
let selectedIds = [];

const teamSelectScreen = document.getElementById("team-select-screen");
const battleScreen     = document.getElementById("battle-screen");

const searchInput      = document.getElementById("search-input");
const pokemonListEl    = document.getElementById("pokemon-list");
const selectedTeamEl   = document.getElementById("selected-team");
const selectedCountEl  = document.getElementById("selected-count");
const validateTeamBtn  = document.getElementById("validate-team-btn");

const leadPopup        = document.getElementById("lead-popup");
const leadOptionsEl    = document.getElementById("lead-options");
const cancelLeadBtn    = document.getElementById("cancel-lead");

const infoPopup        = document.getElementById("pokemon-info-popup");
const infoCloseBtn     = document.getElementById("info-close-btn");
const infoNameEl       = document.getElementById("pokemon-info-name");
const infoSpriteEl     = document.getElementById("pokemon-info-sprite");
const infoTypesEl      = document.getElementById("pokemon-info-types");
const infoStatsEl      = document.getElementById("pokemon-info-stats");
const infoMovesEl      = document.getElementById("pokemon-info-moves");

const playerNameEl = document.getElementById("player-name");
const aiNameEl     = document.getElementById("ai-name");
const playerHPText = document.getElementById("player-hp-text");
const aiHPText     = document.getElementById("ai-hp-text");
const playerHPFill = document.getElementById("player-hp-fill");
const aiHPFill     = document.getElementById("ai-hp-fill");
const playerRemEl  = document.getElementById("player-remaining");
const aiRemEl      = document.getElementById("ai-remaining");
const playerSprite = document.getElementById("player-sprite");
const aiSprite     = document.getElementById("ai-sprite");
const movesContainer = document.getElementById("moves-container");
const switchButton   = document.getElementById("switch-button");
const logEl          = document.getElementById("log");
const teamIconsEl    = document.getElementById("player-team-icons");

const switchPopup     = document.getElementById("switch-popup");
const switchCloseBtn  = document.getElementById("switch-close-btn");
const switchOptionsEl = document.getElementById("switch-options");

const endPopup       = document.getElementById("end-popup");
const popupTitle     = document.getElementById("popup-title");
const popupMessage   = document.getElementById("popup-message");
const popupRestart   = document.getElementById("popup-restart");

// Boutons de difficulté
const diffEasyBtn   = document.getElementById("difficulty-easy");
const diffMediumBtn = document.getElementById("difficulty-medium");
const diffHardBtn   = document.getElementById("difficulty-hard");

/*************************************************************
 * UI – LOG / PV / MOVES / TEAM
 *************************************************************/
function logMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  logEl.appendChild(p);
  logEl.scrollTop = logEl.scrollHeight;
}

function updateHP(fill, text, current, max, statusId) {
  const r = current / max;
  fill.style.width = (r * 100) + "%";
  if (r > 0.5) fill.style.background = "#22c55e";
  else if (r > 0.25) fill.style.background = "#facc15";
  else fill.style.background = "#ef4444";

  let base = `${current} / ${max} PV`;
  if (statusId && STATUS_DB[statusId]) {
    base += ` • ${STATUS_DB[statusId].short}`;
  }
  text.textContent = base;
}

function updateTeamIcons(team) {
  teamIconsEl.innerHTML = "";
  team.pokemons.forEach(p => {
    const s = document.createElement("div");
    s.className = "slot" + (p.isFainted() ? " dead" : "");
    const img = document.createElement("img");
    img.src = p.spriteFront;
    s.appendChild(img);
    teamIconsEl.appendChild(s);
  });
}

function renderMoves(mon) {
  movesContainer.innerHTML = "";
  mon.moves.forEach(move => {
    const btn = document.createElement("button");
    btn.className = "move-btn";
    const typeClass = `type-${move.type}`;
    const catText =
      move.category === "physical" ? "P" :
      move.category === "special" ? "S" : "St";

    btn.innerHTML = `
      <span>${move.name} (${catText})</span>
      <span class="move-type-badge ${typeClass}">
        ${TYPE_CHART[move.type]?.name || move.type}
      </span>
    `;
    btn.onclick = () => {
      if (engine.gameOver || engine.isResolving || engine.playerMustSwitch) return;
      engine.doTurn({ type:"move", move });
    };
    movesContainer.appendChild(btn);
  });
}

/*************************************************************
 * POPUP DE SWITCH
 *************************************************************/
function buildSwitchPopup(force, onChoose) {
  switchOptionsEl.innerHTML = "";

  const team = playerTeam;

  team.pokemons.forEach((p, idx) => {
    if (p.isFainted()) return;
    if (!force && idx === team.activeIndex) return;

    const card = document.createElement("div");
    card.className = "switch-card";

    const img = document.createElement("img");
    img.src = p.spriteFront;

    const bar = document.createElement("div");
    bar.className = "switch-hp-bar";

    const fill = document.createElement("div");
    fill.className = "switch-hp-fill";
    const ratio = p.currentHP / p.maxHP;
    fill.style.width = (ratio * 100) + "%";
    if (ratio > 0.5) fill.style.background = "#22c55e";
    else if (ratio > 0.25) fill.style.background = "#facc15";
    else fill.style.background = "#ef4444";
    bar.appendChild(fill);

    const hpText = document.createElement("div");
    hpText.className = "switch-hp-text";
    hpText.textContent = `${p.currentHP} / ${p.maxHP} PV`;

    card.appendChild(img);
    card.appendChild(bar);
    card.appendChild(hpText);

    card.onclick = () => {
      onChoose(idx);
    };

    switchOptionsEl.appendChild(card);
  });

  if (force) {
    switchCloseBtn.style.display = "none";
    switchCloseBtn.onclick = null;
  } else {
    switchCloseBtn.style.display = "block";
    switchCloseBtn.onclick = () => {
      switchPopup.classList.add("hidden");
    };
  }

  switchPopup.classList.remove("hidden");
}

function openSwitchMenu() {
  if (engine.playerMustSwitch || engine.gameOver || engine.isResolving) return;
  buildSwitchPopup(false, (idx) => {
    switchPopup.classList.add("hidden");
    engine.doTurn({ type:"switch", toIndex: idx });
  });
}

function openForcedSwitchMenu() {
  buildSwitchPopup(true, (idx) => {
    playerTeam.switchTo(idx);
    engine.playerMustSwitch = false;
    switchPopup.classList.add("hidden");
    animateEntry("player");
    updateUI();
    logMessage(`Vous envoyez ${playerTeam.active.name}.`);
  });
}

/*************************************************************
 * FIN DE COMBAT
 *************************************************************/
function endBattle(winner) {
  popupTitle.textContent = winner === "player" ? "Victoire !" : "Défaite…";
  popupMessage.textContent =
    winner === "player"
      ? "Tous les Pokémon adverses sont K.O. Bravo !"
      : "Tous vos Pokémon sont K.O. Courage pour la prochaine fois.";
  endPopup.classList.remove("hidden");
}

popupRestart.onclick = () => {
  location.reload();
};

function updateUI() {
  if (!engine) return;
  const p = playerTeam.active;
  const a = aiTeam.active;

  playerNameEl.textContent = p.name;
  aiNameEl.textContent     = a.name;

  updateHP(playerHPFill, playerHPText, p.currentHP, p.maxHP, p.status);
  updateHP(aiHPFill, aiHPText, a.currentHP, a.maxHP, a.status);

  playerRemEl.textContent = `Pokémon restants : ${playerTeam.remainingCount()}/${playerTeam.pokemons.length}`;
  aiRemEl.textContent     = `Pokémon restants : ${aiTeam.remainingCount()}/${aiTeam.pokemons.length}`;

  playerSprite.src = p.spriteBack;
  aiSprite.src     = a.spriteFront;

  updateTeamIcons(playerTeam);
  renderMoves(p);
}

/*************************************************************
 * SÉLECTION D'ÉQUIPE
 *************************************************************/
function renderPokemonList() {
  pokemonListEl.innerHTML = "";
  const q = searchInput.value.trim().toLowerCase();
  ALL_POKEMON_IDS.forEach(id => {
    const p = POKEMON_DB[id];
    if (!p) return;
    if (q && !p.name.toLowerCase().includes(q)) return;

    const row = document.createElement("div");
    row.className = "pokemon-entry";

    const already = selectedIds.includes(id);
    if (already) row.classList.add("selected");

    row.onclick = () => {
      if (already) return;
      addPokemonToTeam(id);
    };

    const spriteWrap = document.createElement("div");
    spriteWrap.className = "pokemon-entry-sprite";

    const img = document.createElement("img");
    img.src = p.spriteFront;
    spriteWrap.appendChild(img);

    const nameDiv = document.createElement("div");
    nameDiv.className = "pokemon-entry-name";
    nameDiv.textContent = p.name;

    const btns = document.createElement("div");
    btns.className = "pokemon-entry-buttons";

    const info = document.createElement("button");
    info.className = "btn btn-secondary btn-small";
    info.textContent = "Infos";
    info.onclick = (e) => {
      e.stopPropagation();
      openInfoPopup(id);
    };
    btns.appendChild(info);

    row.appendChild(spriteWrap);
    row.appendChild(nameDiv);
    row.appendChild(btns);

    pokemonListEl.appendChild(row);
  });
}

function updateSelectedTeam() {
  selectedTeamEl.innerHTML = "";
  selectedIds.forEach((id, idx) => {
    const p = POKEMON_DB[id];
    const slot = document.createElement("div");
    slot.className = "team-slot";

    const img = document.createElement("img");
    img.src = p.spriteFront;

    const cross = document.createElement("span");
    cross.className = "team-slot-remove";
    cross.textContent = "✕";
    cross.title = "Retirer ce Pokémon";
    cross.onclick = (e) => {
      e.stopPropagation();
      selectedIds.splice(idx,1);
      updateSelectedTeam();
      renderPokemonList();
    };

    slot.appendChild(img);
    slot.appendChild(cross);
    selectedTeamEl.appendChild(slot);
  });

  for (let i = selectedIds.length; i < 6; i++) {
    const s = document.createElement("div");
    s.className = "team-slot";
    const text = document.createElement("span");
    text.className = "placeholder";
    text.textContent = "Vide";
    s.appendChild(text);
    selectedTeamEl.appendChild(s);
  }

  selectedCountEl.textContent = selectedIds.length;
  validateTeamBtn.disabled = selectedIds.length !== 6;
}

/*************************************************************
 * POPUP INFOS POKÉMON
 *************************************************************/
function openInfoPopup(id) {
  const p = POKEMON_DB[id];
  infoNameEl.textContent = p.name;
  infoSpriteEl.src = p.spriteFront;
  infoTypesEl.textContent = p.types.map(t => TYPE_CHART[t]?.name || t).join(" / ");

  infoStatsEl.innerHTML = "";
  const labels = {
    hp:"PV",
    attack:"Attaque",
    defense:"Défense",
    spAttack:"Att. Spéciale",
    spDefense:"Def. Spéciale",
    speed:"Vitesse"
  };
  Object.keys(p.baseStats).forEach(k => {
    const li = document.createElement("li");
    li.textContent = `${labels[k]} : ${p.baseStats[k]}`;
    infoStatsEl.appendChild(li);
  });

  infoMovesEl.innerHTML = "";
  p.moveIds.forEach(mid => {
    const m = MOVES_DB[mid];
    if (!m) return;
    const li = document.createElement("li");
    const catLabel =
      m.category === "physical" ? "Physique" :
      m.category === "special" ? "Spéciale" :
      "Statut";

    li.textContent = `${m.name} (${TYPE_CHART[m.type]?.name || m.type}, ${catLabel}, Précision ${m.accuracy}%, Puissance ${m.power})`;
    infoMovesEl.appendChild(li);
  });

  infoPopup.classList.remove("hidden");
}

infoCloseBtn.onclick = () => infoPopup.classList.add("hidden");

/*************************************************************
 * POPUP CHOIX DU LEAD
 *************************************************************/
validateTeamBtn.onclick = () => {
  if (selectedIds.length !== 6) return;
  leadOptionsEl.innerHTML = "";
  selectedIds.forEach(id => {
    const p = POKEMON_DB[id];
    const div = document.createElement("div");
    div.className = "lead-choice";
    const img = document.createElement("img");
    img.src = p.spriteFront;
    div.appendChild(img);
    div.onclick = () => startBattleWithLead(id);
    leadOptionsEl.appendChild(div);
  });
  leadPopup.classList.remove("hidden");
};

cancelLeadBtn.onclick = () => leadPopup.classList.add("hidden");

/*************************************************************
 * TEAM IA SELON DIFFICULTÉ
 *************************************************************/
function buildAiTeamIds(playerIds) {
  const playerTemplates = (playerIds || [])
    .map(id => POKEMON_DB[id])
    .filter(Boolean);

  const rated = ALL_POKEMON_IDS.map(id => {
    const tpl = POKEMON_DB[id];
    if (!tpl) return { id, rating: -9999 };

    let baseRating = ratePokemonForDifficulty(tpl);

    if (difficulty === "hard" && playerTemplates.length > 0) {
      let vsPlayerScore = 0;
      playerTemplates.forEach(pTpl => {
        let bestMult = 0;
        tpl.moveIds.forEach(mid => {
          const m = MOVES_DB[mid];
          if (!m || m.category === "status" || !m.power) return;
          const mult = typeModifier(m.type, pTpl.types);
          if (mult > bestMult) bestMult = mult;
        });
        if (bestMult > 1) vsPlayerScore += 5 * bestMult;
        else if (bestMult === 1) vsPlayerScore += 1;

        pTpl.types.forEach(atkType => {
          const mult = typeModifier(atkType, tpl.types);
          if (mult < 1) vsPlayerScore += 3;
          else if (mult > 1) vsPlayerScore -= 4 * mult;
        });
      });

      baseRating += vsPlayerScore;
    }

    return { id, rating: baseRating };
  }).sort((a, b) => b.rating - a.rating);

  let pool;
  if (difficulty === "easy") {
    const reversed = [...rated].reverse();
    pool = reversed.slice(0, Math.min(12, reversed.length));
  } else if (difficulty === "medium") {
    pool = rated;
  } else {
    pool = rated.slice(0, Math.min(12, rated.length));
  }

  const temp = [...pool];
  const result = [];
  while (result.length < 6 && temp.length > 0) {
    let idx;
    if (difficulty === "easy") {
      const maxIdx = Math.min(temp.length - 1, 8);
      idx = randInt(0, maxIdx);
    } else if (difficulty === "medium") {
      const maxIdx = Math.min(temp.length - 1, 10);
      idx = randInt(0, maxIdx);
    } else {
      const maxIdx = Math.min(temp.length - 1, 4);
      idx = randInt(0, maxIdx);
    }
    result.push(temp[idx].id);
    temp.splice(idx, 1);
  }

  while (result.length < 6) {
    const id = ALL_POKEMON_IDS[randInt(0, ALL_POKEMON_IDS.length - 1)];
    if (!result.includes(id)) result.push(id);
  }

  return result;
}

/*************************************************************
 * LANCEMENT DU COMBAT
 *************************************************************/
function startBattleWithLead(leadId) {
  leadPopup.classList.add("hidden");
  const ids = [...selectedIds];
  const i = ids.indexOf(leadId);
  if (i > -1) {
    ids.splice(i,1);
    ids.unshift(leadId);
  }

  let aiIds = buildAiTeamIds(ids);

  if (difficulty === "hard") {
    const playerLeadTpl = POKEMON_DB[leadId];
    if (playerLeadTpl) {
      let bestIdx = 0;
      let bestScore = -Infinity;

      aiIds.forEach((aid, idx) => {
        const tpl = POKEMON_DB[aid];
        if (!tpl) return;
        let score = 0;

        let bestMult = 0;
        tpl.moveIds.forEach(mid => {
          const m = MOVES_DB[mid];
          if (!m || m.category === "status" || !m.power) return;
          const mult = typeModifier(m.type, playerLeadTpl.types);
          if (mult > bestMult) bestMult = mult;
        });
        score += bestMult * 8;

        playerLeadTpl.types.forEach(atkType => {
          const mult = typeModifier(atkType, tpl.types);
          if (mult < 1) score += 4;
          else if (mult > 1) score -= 6 * mult;
        });

        if (score > bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });

      if (bestIdx !== 0) {
        const tmp = aiIds[0];
        aiIds[0] = aiIds[bestIdx];
        aiIds[bestIdx] = tmp;
      }
    }
  }

  playerTeam = new Team(ids);
  aiTeam     = new Team(aiIds);
  engine     = new BattleEngine(playerTeam, aiTeam);

  teamSelectScreen.classList.remove("visible");
  battleScreen.classList.add("visible");

  logEl.innerHTML = "";
  logMessage(`Mode de difficulté : ${difficulty === "easy" ? "Facile" : difficulty === "medium" ? "Moyen" : "Difficile"}.`);
  logMessage("Le combat commence !");
  logMessage(`Vous envoyez ${playerTeam.active.name}.`);
  logMessage(`L'adversaire envoie ${aiTeam.active.name}.`);
  animateEntry("player");
  animateEntry("ai");
  updateUI();
}

/*************************************************************
 * INIT / DIFFICULTÉ / EVENTS
 *************************************************************/
function addPokemonToTeam(id) {
  if (selectedIds.length >= 6) return;
  if (selectedIds.includes(id)) return;
  selectedIds.push(id);
  updateSelectedTeam();
  renderPokemonList();
}

searchInput.addEventListener("input", renderPokemonList);
switchButton.addEventListener("click", openSwitchMenu);

function waitMs(ms) { return new Promise(res => setTimeout(res, ms)); }

function setupDifficultyButtons() {
  if (!diffEasyBtn || !diffMediumBtn || !diffHardBtn) return;

  const all = [diffEasyBtn, diffMediumBtn, diffHardBtn];

  function setDiff(mode) {
    difficulty = mode;
    all.forEach(btn => btn.classList.remove("active"));
    if (mode === "easy") diffEasyBtn.classList.add("active");
    else if (mode === "medium") diffMediumBtn.classList.add("active");
    else diffHardBtn.classList.add("active");
  }

  diffEasyBtn.onclick   = () => setDiff("easy");
  diffMediumBtn.onclick = () => setDiff("medium");
  diffHardBtn.onclick   = () => setDiff("hard");

  // par défaut : moyen
  setDiff("medium");
}

function init() {
  selectedIds = [];
  updateSelectedTeam();
  renderPokemonList();
  setupDifficultyButtons();
  teamSelectScreen.classList.add("visible");
}

init();
