import { getGlobals } from '../GlobalsManager';
import { isActive } from '../utils';
import { State } from './State';

export class HealerState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Healing`);
    }

    execute(creep) {
        if (!isActive(creep)) {return}
        if (getGlobals().SORTED_ALLY_INJURED.length) {
            creep.heal(getGlobals().SORTED_ALLY_INJURED[0])
        } else {
            const closeDps = creep.findClosestByPath(getGlobals().ALLY_DPS)
            creep.follow(closeDps)
        }

    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Healing`);
    }
}

