import { getGlobals } from '../GlobalsManager';
import { State } from './State';
import { isActive } from '../utils';
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from 'game/constants';
import { isUp } from '../utils';

export class WorkerStaticState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Static Working (static)`);

        const GLOBALS = getGlobals();
        const spawnUp = isUp();
        const availablePositions = GLOBALS.WORKER_POSITIONS[spawnUp ? 'up' : 'down'];

        // Chercher une position libre
        const freeSpot = availablePositions.find(pos => !pos.occupied);

        if (freeSpot) {
            creep.staticPosition = { x: freeSpot.x, y: freeSpot.y };
            freeSpot.occupied = true;
        } else {
            console.log(`No free spot found for static worker ${creep.id}`);
            creep.staticPosition = null; // Pas de spot disponible
        }
    }

    execute(creep) {
        if (!isActive(creep)) { return; }

        
        const GLOBALS = getGlobals();

        if (!creep.staticPosition) return; // Pas de position assignée

        if (creep.x !== creep.staticPosition.x || creep.y !== creep.staticPosition.y) {
            // Pas encore en place, on bouge
            creep.moveTo(creep.staticPosition);
            return;
        }

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.harvest(GLOBALS.SOURCE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(GLOBALS.SOURCE);
            }
        } else {
            creep.drop(RESOURCE_ENERGY);
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Static Working (static)`);
    }
}