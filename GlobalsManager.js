// GlobalsManager.js
import { getObjectsByPrototype } from 'game/utils';
import { StructureContainer, Creep, Source, StructureSpawn } from 'game/prototypes';
import { ScoreCollector } from 'arena/season_beta/collect_and_control/basic';
import { HEAL } from 'game/constants';

const GLOBALS = {
    ENEMY: [],
    CONTAINERS: [],
    SPAWNER: null,
    ENEMY_SPAWNER: null,
    SCORECOLLECTOR: null,
    SOURCE: null,
    MAX_HARVESTER: 6,
    SORTED_ALLY_INJURED: [],
    SORTED_ENEMY_HEALER: [],
    ALLY_HEALER: [],
    ALLY_DPS: [],
    WORKER_POSITIONS: {
        up: [
            { x: 3, y: 1, occupied: false },
            { x: 4, y: 1, occupied: false },
            { x: 5, y: 1, occupied: false },
        ],
        down: [
            { x: 3, y: 97, occupied: false },
            { x: 4, y: 97, occupied: false },
            { x: 5, y: 97, occupied: false },
        ],
    },
    MOVER_POSITIONS: {
        up: { x: 4, y: 2 },
        down: { x: 4, y: 96 },
    },
};

export function initializeGlobals() {
    GLOBALS.SPAWNER = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    GLOBALS.ENEMY_SPAWNER = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
    GLOBALS.SCORECOLLECTOR = getObjectsByPrototype(ScoreCollector)[0];
    GLOBALS.SOURCE = GLOBALS.SPAWNER?.findClosestByPath(getObjectsByPrototype(Source)) || null;
}

export function refreshGlobals() {
    GLOBALS.ENEMY = getObjectsByPrototype(Creep).filter(c => !c.my);
    GLOBALS.CONTAINERS = getObjectsByPrototype(StructureContainer).filter(c => c.store.score > 0);
}

export function refreshCombatGlobals(creepsArmy) {
    GLOBALS.SORTED_ALLY_INJURED = creepsArmy.filter(creep => creep.hits < creep.hitsMax).sort((a, b) => a.hits - b.hits);
    GLOBALS.ALLY_HEALER = creepsArmy.filter(creep => creep.kind === 'healer');
    GLOBALS.ALLY_DPS = creepsArmy.filter(creep => creep.kind !== 'healer');

    GLOBALS.SORTED_ENEMY_HEALER = GLOBALS.ENEMY
        .filter(enemy => enemy.body.some(bodyPart => bodyPart.type === HEAL))
        .sort((a, b) => a.hits - b.hits);
}

export function getGlobals() {
    return GLOBALS;
}

