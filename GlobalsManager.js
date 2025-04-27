// GlobalsManager.js
import { getObjectsByPrototype } from 'game/utils';
import { StructureContainer, Creep, Source, StructureSpawn } from 'game/prototypes';
import { ScoreCollector } from 'arena/season_beta/collect_and_control/basic';

const GLOBALS = {
    ENEMY: [],
    CONTAINERS: [],
    SPAWNER: null,
    ENEMY_SPAWNER: null,
    SCORECOLLECTOR: null,
    SOURCE: null,
    MAX_HARVESTER: 3,
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

export function getGlobals() {
    return GLOBALS;
}

