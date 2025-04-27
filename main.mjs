import { createConstructionSite, getObjectsByPrototype } from 'game/utils';
import { StructureTower, StructureContainer, Creep, StructureSpawn, Source, } from 'game/prototypes';
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY, MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH } from 'game/constants';
import { initializeGlobals, refreshGlobals, getGlobals, refreshCombatGlobals } from './GlobalsManager';
import { registerCreep, getMyCreeps, cleanDeadCreeps } from './CreepManager';
import { RESOURCE_SCORE, ScoreCollector } from 'arena/season_beta/collect_and_control/basic';
import { MyCreep } from './MyCreep';

let counter = 0
let shouldAttack = false


let shouldBuildWorker = true
let shouldBuilMover = false
let shouldBuildHarvester = false
let shouldBuildArmy = false

initializeGlobals();


const updateFlags = () => {

    // if (getMyCre eps().workers.length < 2) {
    //     getMyCreeps().workers.forEach(worker => {
    //         worker.stateMachine.changeState(new WorkerState());
    //     });
    // }

    if (getMyCreeps().workers.length >= 3) {
        shouldBuildWorker = false
        shouldBuilMover = true
    }
    if (getMyCreeps().movers.length >= 1) {
        shouldBuildWorker = false
        shouldBuilMover = false
        shouldBuildHarvester = true
        getMyCreeps().workers.forEach(worker => {
            worker.stateMachine.changeState('workerStaticState');
        });
    }
    if (getMyCreeps().scoreHarvesters.length >= getGlobals().MAX_HARVESTER) {
        shouldBuildWorker = false
        shouldBuilMover = false
        shouldBuildHarvester = false
        shouldBuildArmy = true
    }
}

export function loop() {
    // keep this first !
    refreshGlobals();

    cleanDeadCreeps();


    // updateHarvesterNumber()
    updateFlags()

    createWorker(getGlobals().SPAWNER)

    createMover(getGlobals().SPAWNER)

    createHarvester(getGlobals().SPAWNER)

    createArmy(getGlobals().SPAWNER)

    getMyCreeps().workers.forEach(worker => {
        worker.stateMachine.update()
    })

    getMyCreeps().movers.forEach(mover => {
        mover.stateMachine.update()
    })


    getMyCreeps().scoreHarvesters.forEach(harvester => {
        // harvester.resetTarget()
        harvester.stateMachine.update()
    })

    if (getMyCreeps().army.length > 0) {
        shouldAttack = true
    }

    if (shouldAttack) {
        handleAttack(getMyCreeps().army)
    }
}

const createWorker = (spawner) => {

    if (shouldBuildWorker) {
        const o = spawner.spawnCreep([MOVE, WORK, CARRY]).object
        if (o) {
            const myCreep = new MyCreep(o, 'worker')
            registerCreep(myCreep, 'worker');
        }
    }
}

const createMover = (spawner) => {

    if (shouldBuilMover) {
        const o = spawner.spawnCreep([MOVE, CARRY]).object
        if (o) {
            const myCreep = new MyCreep(o, 'mover')
            registerCreep(myCreep, 'mover');
        }
    }
}

const createHarvester = (spawner) => {
    if (shouldBuildHarvester) {
        const o = spawner.spawnCreep([MOVE,CARRY,MOVE,CARRY]).object
        if (o) {
            const myCreep = new MyCreep(o, 'harvester');
            registerCreep(myCreep, 'harvester');
        }
    }
}



const createArmy = (spawner) => {

    if (shouldBuildArmy) {
        if (counter == 0 || counter == 1 || counter == 2 || counter == 3 || counter == 4 || counter == 5) {
            //ranged
            const o = spawner.spawnCreep([RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE ]).object
            if (o) {
                const myCreep = new MyCreep(o, 'ranged')
                registerCreep(myCreep, 'ranged')
                counter++
            }
        } else if (counter == 6) {
            // //heal
            // const o = spawner.spawnCreep([MOVE, HEAL, MOVE, HEAL]).object
            // if (o) {
            //     const myCreep = new MyCreep(o, 'healer')
            //     registerCreep(myCreep, 'healer');
            //     counter = 0
            // }
            const o = spawner.spawnCreep([RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE ]).object
            if (o) {
                const myCreep = new MyCreep(o, 'ranged')
                registerCreep(myCreep, 'ranged')
                counter = 0
            }
        }
    }
}

const handleAttack = (creepsArmy) => {
    refreshCombatGlobals(creepsArmy);

    getMyCreeps().army.forEach(armyCreep => {
        armyCreep.resetTarget()
        armyCreep.stateMachine.update()
    })

}

const updateHarvesterNumber = () => {
    const harvesterEnemey = getGlobals().ENEMY.filter(creep => creep.body.some(bodyPart => bodyPart.type == CARRY) && !creep.body.some(bodyPart => bodyPart.type == WORK))
    if (harvesterEnemey.length >= 3) {
        getGlobals().MAX_HARVESTER = harvesterEnemey.length + 2
    } else {
        getGlobals().MAX_HARVESTER = 3
    }
}

