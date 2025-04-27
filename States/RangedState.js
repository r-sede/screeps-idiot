import { getGlobals } from '../GlobalsManager';
import { isActive } from '../utils';
import { State } from './State';

export class RangedState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Ranged Attack`);
    }

    execute(creep) {
        if (!isActive(creep)) {return}
        
        const GLOBALS = getGlobals();

        if (GLOBALS.SORTED_ENEMY_HEALER.length) {
            creep.rangedAttack(creep.findClosestByPath(GLOBALS.SORTED_ENEMY_HEALER))
        } else if (GLOBALS.ENEMY.length) {
            creep.rangedAttack(creep.findClosestByPath(GLOBALS.ENEMY))
        } else {
            console.log(GLOBALS.ENEMY_SPAWNER)
            creep.rangedAttack(GLOBALS.ENEMY_SPAWNER)
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Ranged Attack`);
    }
}

