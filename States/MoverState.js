import { getGlobals } from '../GlobalsManager';
import { isActive, isUp } from '../utils';
import { State } from './State';
import { getObjectsByPrototype } from 'game/utils';
import { Resource } from 'game/prototypes';
import { RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';

export class MoverState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Moving Resources`);

        const GLOBALS = getGlobals();
        const spawnUp = isUp();

        // Assigner la position fixe selon spawn haut/bas
        creep.staticPosition = GLOBALS.MOVER_POSITIONS[spawnUp ? 'up' : 'down'];
    }

    execute(creep) {
        if (!isActive(creep)) { return; }

        const GLOBALS = getGlobals();

        // Si pas à sa position
        if (creep.x !== creep.staticPosition.x || creep.y !== creep.staticPosition.y) {
            creep.moveTo(creep.staticPosition);
            return;
        }

        //  transporte déjà de l'énergie, chercher à pickup plus si possible
        if (creep.store[RESOURCE_ENERGY] > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            // Il est partiellement rempli -> checker ressources autour
            const droppedResources = getObjectsByPrototype(Resource).filter(r => r.resourceType === RESOURCE_ENERGY);

            // Chercher les ressources proches (par range, pas besoin d'un vrai path)
            const nearbyDrops = creep.findInRange(droppedResources, 3); // dans un rayon de 3 cases

            if (nearbyDrops.length > 0) {
                const closestDrop = creep.findClosestByRange(nearbyDrops);
                if (closestDrop) {
                    if (creep.pickup(closestDrop) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestDrop);
                    }
                }
                return; // Ne pas partir livrer tant qu'on peut charger plus
            }
        }

        // 3. S'il transporte de l'énergie (et plus rien à ramasser proche) → livrer au spawn
        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (creep.transfer(GLOBALS.SPAWNER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(GLOBALS.SPAWNER);
            }
            return;
        }

        // 4. Sinon il est vide → chercher énergie au sol
        const droppedResources = getObjectsByPrototype(Resource).filter(r => r.resourceType === RESOURCE_ENERGY);
        const closestDrop = creep.findClosestByPath(droppedResources);

        if (closestDrop) {
            if (creep.pickup(closestDrop) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDrop);
            }
        }
        // Pas de ressources → rester sur place
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Moving Resources`);
    }
}