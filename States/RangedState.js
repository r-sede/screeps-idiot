import { getGlobals } from '../GlobalsManager';
import { isActive } from '../utils';
import { State } from './State';

export class RangedState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Ranged Attack`);
    }

    execute(creep) {
        if (!isActive(creep)) {return}

        if (getGlobals().SORTED_ENEMY_HEALER.length) {
            creep.rangedAttack(creep.findClosestByPath(getGlobals().SORTED_ENEMY_HEALER))
        } else if (getGlobals().ENEMY.length) {
            creep.rangedAttack(creep.findClosestByPath(getGlobals().ENEMY))
        } else {
            console.log(getGlobals().ENEMY_SPAWNER)
            creep.rangedAttack(getGlobals().ENEMY_SPAWNER)
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Ranged Attack`);
    }
}

