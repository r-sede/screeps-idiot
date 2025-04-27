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

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.harvest(getGlobals().SOURCE) === ERR_NOT_IN_RANGE) {
            creep.moveTo(getGlobals().SOURCE)
        }
    } else {
        if (creep.transfer(getGlobals().SPAWNER, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(getGlobals().SPAWNER)
        }
    }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Harvesting`);
    }
}
