import { getGlobals } from '../GlobalsManager';
import { State } from './State';
import { isActive } from '../utils';
import { RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { getObjectsByPrototype } from 'game/utils';
import { Resource } from 'game/prototypes';
import { isUp } from '../utils';

export class MoverState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Moving Resources`);

        const spawnUp = isUp();
        const GLOBALS = getGlobals();
        creep.staticPosition = GLOBALS.MOVER_POSITIONS[spawnUp ? 'up' : 'down'];
    }

    execute(creep) {
        if (!isActive(creep)) { return; }
        

        const GLOBALS = getGlobals();

        if (creep.x !== creep.staticPosition.x || creep.y !== creep.staticPosition.y) {
            creep.moveTo(creep.staticPosition);
            return;
        }

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            // 🛒 1. Chercher de l'énergie au sol
            const droppedResources = getObjectsByPrototype(Resource).filter(r => r.resourceType === RESOURCE_ENERGY);
            const closestDrop = creep.findClosestByPath(droppedResources);

            if (closestDrop) {
                if (creep.pickup(closestDrop) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDrop);
                }
            } else {
                // Pas de ressource au sol -> idle / attendre / se rapprocher des workers
                // Option : bouger vers les workers statiques si besoin
            }

        } else {
            // 📦 2. Transporter vers le Spawn
            if (creep.transfer(GLOBALS.SPAWNER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(GLOBALS.SPAWNER);
            }
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Moving Resources`);
    }
}
