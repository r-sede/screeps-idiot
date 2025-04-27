import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from 'game/constants';
import { isActive } from '../utils';
import { State } from './State';
import { getGlobals } from '../GlobalsManager';

export class WorkerState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Working`);
    }

    execute(creep) {
    if (!isActive(creep)) {return}
    
    const GLOBALS = getGlobals();

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.harvest(GLOBALS.SOURCE) === ERR_NOT_IN_RANGE) {
            creep.moveTo(GLOBALS.SOURCE)
        }
    } else {
        if (creep.transfer(GLOBALS.SPAWNER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(GLOBALS.SPAWNER)
        }
    }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Harvesting`);
    }
}
