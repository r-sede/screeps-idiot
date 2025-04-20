import { createConstructionSite, getObjectsByPrototype } from 'game/utils';
import { StructureTower, StructureContainer, Creep, StructureSpawn, Source, } from 'game/prototypes';
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY, MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL } from 'game/constants';

import { RESOURCE_SCORE, ScoreCollector } from 'arena/season_beta/collect_and_control/basic';

let counter = 0
const creepsArmy = []
const workers = []
let shouldAttack = false

const scoreHarvester = []

export function loop() {
    const spawner = getObjectsByPrototype(StructureSpawn).filter(spawner => spawner.my)[0]
    const sources  = getObjectsByPrototype(Source)
    const source = spawner.findClosestByPath(sources)

    const scoreCollector = getObjectsByPrototype(ScoreCollector)[0]



    if (workers.length <= 1 && !spawner.spawning) {
        const o = spawner.spawnCreep([MOVE, WORK, CARRY]).object
        if (o) {
            o.kind ='worker'
            workers.push(o)
        }
    }

    workers.forEach(worker => {
        handleWorker(spawner, source, worker)

    })

    createHarvester(workers, spawner)

    createArmy(workers, spawner)


    scoreHarvester.forEach(worker => {
        handleScoreHarvester(scoreCollector, worker)

    })

    if (creepsArmy.length > 3) {
        shouldAttack = true
    }

    if (shouldAttack) {
        handleAttack(creepsArmy)
    }
}


const createHarvester = (workers, spawner) => {
    let okToBuildHarvester = true

    workers.forEach(worker => {
        if ( !(worker && worker.store && !spawner.spawning)) {
            okToBuildHarvester = false
        }
    })

    if (okToBuildHarvester) {
        const o = spawner.spawnCreep([MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]).object
        if (o) {
            o.kind = 'harvest'
            scoreHarvester.push(o)
            counter++
        }
    }
}

const createArmy = (workers, spawner) => {

    let okToBuildArmy = true

    workers.forEach(worker => {
        if ( !(worker && worker.store && !spawner.spawning && scoreHarvester.length >= 2)  ) {
            okToBuildArmy = false
        }
    })

    if (okToBuildArmy) {
        if (counter == 0 || counter == 1) {
            //ranged
            const o = spawner.spawnCreep([MOVE, RANGED_ATTACK]).object
            if (o) {
                o.kind = 'ranged'
                creepsArmy.push(o)
                counter++
            }
        } else if (counter == 2) {
            //cac
            const o = spawner.spawnCreep([MOVE, ATTACK]).object
            if (o) {
                o.kind = 'cac'
                creepsArmy.push(o)
                counter++
            }
        }
        else if (counter == 3) {
            //heal
            const o = spawner.spawnCreep([MOVE, HEAL]).object
            if (o) {
                o.kind = 'heal'
                o.targetToHeal = null
                creepsArmy.push(o)
                counter = 0
            }
        }
    }
}

const handleWorker = (spawner, source, creep) => {
    if (!creep.store) {return}
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source)
        }
    } else {
        if (creep.transfer(spawner, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawner)
        }
    }
}

const handleScoreHarvester = (scoreCollector, creep) => {
    if (!creep.store) {return}
    const containers = getObjectsByPrototype(StructureContainer).filter(container => container.store.score > 0)
    const container = creep.findClosestByPath(containers)
    if (creep.store.getFreeCapacity(RESOURCE_SCORE) > 0) {
        if (creep.withdraw(container, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container)
        }
    } else {
        if (creep.transfer(scoreCollector, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
            creep.moveTo(scoreCollector)
        }
    }
}

const handleAttack = (creepsArmy) => {
    
    const enemy = getObjectsByPrototype(Creep).filter(creep => !creep.my)
    const notHealerEnemy = enemy.filter(creep => creep.body.some(bodyPart => bodyPart.type != HEAL))
    const sortedInjuredCreepsArmy = creepsArmy.filter(creep => creep.hits < creep.hitMax).sort((a, b) => a.hits - b.hits)

    const sortedHealerEnemy = enemy.filter(creep => creep.body.some(bodyPart => bodyPart.type == HEAL)).sort((a, b) => a.hits - b.hits)

    const myHealers = creepsArmy.filter(creep => creep.kind == 'heal')
    const myDPS     = creepsArmy.filter(creep => creep.kind != 'heal')

    const enemySpawn = getObjectsByPrototype(StructureSpawn).filter(spawner => !spawner.my)[0]

    myHealers.forEach(healer => {
        healer.targetToHeal = null
    })

    // console.log(sortedHealerEnemy)
    // console.log(sortedInjuredCreepsArmy)

    if (sortedInjuredCreepsArmy.length) {
        myHealers.forEach(healer => {
            if (!healer.targetToHeal) {
                heal(healer, sortedInjuredCreepsArmy[0])
            }
        });
    } else {
        myHealers.forEach(healer => {
            const closeDps = healer.findClosestByPath(myDPS)
            follow(healer, closeDps)
        });
    }

    if (sortedHealerEnemy.length) {
        myDPS.forEach(dps => {
            if (dps.kind == 'ranged') {
                // console.log(dps)
                rangedAttack(dps, dps.findClosestByPath(sortedHealerEnemy))
            } else {
                attack(dps, dps.findClosestByPath(sortedHealerEnemy))
            }
        })
    }



}


const heal = (creep, creepToHeal) => {
    if (creep.heal(creepToHeal) == ERR_NOT_IN_RANGE) {
        if (creep.rangedHeal(creepToHeal) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creepToHeal);
        }
    }
}
const follow = (creep, creepToFollow) => {
        creep.moveTo(creepToFollow)
}
const rangedAttack = (creep, creepToAttack) => {
    if (creep.rangedAttack(creepToAttack) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creepToAttack);
    }
}

const attack = (creep, creepToAttack) => {
    if (creep.attack(creepToAttack) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creepToAttack);
    }
}