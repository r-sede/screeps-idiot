import { RESOURCE_SCORE } from 'arena/season_beta/collect_and_control/basic';
import { getMyCreeps } from '../CreepManager';
import { getGlobals } from '../GlobalsManager';
import { isActive } from '../utils';
import { State } from './State';
import { ERR_NOT_IN_RANGE } from 'game/constants';

export class HarvestState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Harvesting`);
    }

    execute(creep) {
        if (!isActive(creep)) {return}

        const GLOBALS = getGlobals()

        if (!GLOBALS.SCORECOLLECTOR) {return}

        const container = creep.findClosestByPath(GLOBALS.CONTAINERS)

        if (!container) {return }

        if (creep.store.getFreeCapacity(RESOURCE_SCORE) > 0) {
            if (creep.withdraw(container, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container)
            }
        } else {
            if (creep.transfer(GLOBALS.SCORECOLLECTOR, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(GLOBALS.SCORECOLLECTOR)
            }
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Harvesting`);
    }
}

