import { createConstructionSite, getObjectsByPrototype, getTerrainAt } from 'game/utils';
import { StructureTower, StructureContainer, Creep, StructureSpawn, Source, } from 'game/prototypes';
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY, MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, LEFT, TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, TERRAIN_WALL } from 'game/constants';

import { RESOURCE_SCORE, ScoreCollector } from 'arena/season_beta/collect_and_control/basic';

let counter = 0

const workers = []
const movers = []
const scoreHarvester = []
const creepsArmy = []

let shouldBuildMover = true
let shouldBuildWorker = false
let shouldBuildHarvester = false
let shouldBuildArmy = false

// -----------------------------------

let shouldAttack = false

let maxHarvester = 3

const workersPosition = {
    up : [
        {x:3 , y:1 , creep: null},
        {x:4 , y:1 , creep: null},
        {x:5 , y:1 , creep: null},

    ],
    down: [
        {x:3 , y:97 , creep: null},
        {x:4 , y:97 , creep: null},
        {x:5 , y:97 , creep: null},
    ]
}

let firsId = null

export function loop() {
    const spawner = getObjectsByPrototype(StructureSpawn).filter(spawner => spawner.my)[0]
    const sources  = getObjectsByPrototype(Source)
    const source = spawner.findClosestByPath(sources)

    const scoreCollector = getObjectsByPrototype(ScoreCollector)[0]

    updateHarvesterNumber()

    updateFlags()

    if (shouldBuildMover) {
        const o = spawner.spawnCreep([MOVE, CARRY]).object
        if (o) {
            o.kind ='mover'
            o.shouldHelp = true
            o.isPulling = false
            o.pullingCreep = null
            movers.push(o)
        }
    }

    if (shouldBuildWorker) {
        const o = spawner.spawnCreep([WORK, CARRY]).object
        if (o) {
            o.kind ='worker'
            o.isWorking = false
            o.isPulled = false
            o.pulledBy = null
            workers.push(o)
        }
    }

    createHarvester(spawner)

    createArmy(spawner)

    workers.forEach(worker => {
        handleWorker(spawner, source, worker)
    })

    movers.forEach(mover => {
        handleMover(spawner, source, mover)
    })

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
const updateFlags = () => {

    if (movers.length >= 1) {
        shouldBuildMover = false
        shouldBuildWorker = true
    }

    if (workers.length >= 3) {
        shouldBuildMover = false
        shouldBuildWorker = false
        shouldBuildHarvester = true
    }

    if (scoreHarvester.length >= maxHarvester) {
        shouldBuildMover = false
        shouldBuildWorker = false
        shouldBuildHarvester = false
        shouldBuildArmy = true
    }

}

const updateHarvesterNumber = () => {
    const enemy = getObjectsByPrototype(Creep).filter(creep => !creep.my)
    const harvesterEnemey = enemy.filter(creep => creep.body.some(bodyPart => bodyPart.type == CARRY) && !creep.body.some(bodyPart => bodyPart.type == WORK))
    // console.log(harvesterEnemey.length)
    if (harvesterEnemey.length >= 3) {
        maxHarvester = harvesterEnemey.length + 2
    } else {
        maxHarvester = 3
    }
}

const createHarvester = (spawner) => {
    if (shouldBuildHarvester) {
        const o = spawner.spawnCreep([MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]).object
        if (o) {
            o.kind = 'harvest'
            scoreHarvester.push(o)
        }
    }
}

const createArmy = (spawner) => {

    if (shouldBuildArmy) {
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
            const o = spawner.spawnCreep([MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE ]).object
            if (o) {
                o.kind = 'ranged'
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

const getFreeDestinationToPull = (creep, isUp) => {
    const free = workersPosition[isUp ? 'up' : 'down'].find(position => position.creep == null);
    if (free) {
        console.log(free)
        if (free.x < creep.pullingCreep.x && free.y == creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('LEFT')
            creep.move(LEFT)
        } else if (free.x < creep.pullingCreep.x && free.y < creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('TOP_LEFT')
            creep.move(TOP_LEFT)
        } else if (free.x == creep.pullingCreep.x && free.y < creep.pullingCreep.y) {

            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('TOP')
            if (getTerrainAt({x: creep.x , y: creep.y - 1}) == TERRAIN_WALL || thereIsAworkerHere({x: creep.x , y: creep.y - 1}, isUp)) {
                if (isUp) {
                    creep.move(TOP_RIGHT)
                }
            } else {
                creep.move(TOP)
            }
        } else if (free.x > creep.pullingCreep.x && free.y < creep.pullingCreep.y) {

            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('TOP_RIGHT')
            if (getTerrainAt({x: creep.x + 1, y: creep.y - 1}) == TERRAIN_WALL) {
                if (isUp) {
                    creep.move(RIGHT)
                }
            } else {
                creep.move(TOP_RIGHT)
            }
        } else if (free.x > creep.pullingCreep.x && free.y == creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('RIGHT')
            creep.move(RIGHT)
        } else if (free.x > creep.pullingCreep.x && free.y > creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('BOTTOM_RIGHT')
            creep.move(BOTTOM_RIGHT)
        } else if (free.x == creep.pullingCreep.x && free.y > creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('BOTTOM')
            creep.move(BOTTOM)
        } else if (free.x < creep.x && free.y > creep.pullingCreep.y) {
            creep.pull(creep.pullingCreep)
            creep.pullingCreep.moveTo(creep)
            console.log('BOTTOM_LEFT')
            creep.move(BOTTOM_LEFT)
        } 
        if (free.x == creep.pullingCreep.x && free.y == creep.pullingCreep.y) {
            free.creep = creep.pullingCreep
            creep.isPulling = false
            creep.pullingCreep.isWorking = true
            creep.pullingCreep = null
            console.log('placé')
            if(isUp) {
                creep.move(BOTTOM_LEFT)
            }
        }
    }else {
        console.log('no more free spot')
        creep.shouldHelp =  false
        creep.isPulling = false
        creep.pullingCreep = null
    }

}

const handleMover = (spawner, source, creep) => {

    const isUp = spawner.y - source.y > 0

    if (isFuckingSpawning(creep, spawner) || !creep.store) {return}

    if (firsId == null) {
        firsId = creep.id
        creep.move(BOTTOM_LEFT)
        return
    }
    

    const isWorkerToMove = workers.some(worker => worker.isWorking == false && !isFuckingSpawning(worker, spawner) && !workerIsInPlace(worker, isUp))
    console.log(isWorkerToMove)
    if (isWorkerToMove) {
        // console.log(workers.find(worker => worker.isWorking == false && !isFuckingSpawning(worker, spawner) && !workerIsInPlace(worker, isUp)))
        if (!creep.isPulling) {
            const workerToMove = workers.find(worker => worker.isWorking == false && !isFuckingSpawning(worker, spawner) && !workerIsInPlace(worker, isUp))
            creep.pull(workerToMove)
            workerToMove.moveTo(creep)
            creep.isPulling = true
            creep.pullingCreep = workerToMove
            workerToMove.isPulled = true
            workerToMove.pulledBy = creep
            getFreeDestinationToPull(creep, isUp)
        } else {
            getFreeDestinationToPull(creep, isUp)
        }
    } else {
        
    }

    // if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    //     if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    //         creep.moveTo(source)
    //     }
    // } else {
    //     if (creep.transfer(spawner, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    //         creep.moveTo(spawner)
    //     }
    // }
}

const handleWorker = (spawner, source, creep) => {

    if (creep.spawning || !creep.store) {return}

    // console.log(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
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
    } else if (enemy.length) {
        myDPS.forEach(dps => {
            if (dps.kind == 'ranged') {
                // console.log(dps)
                rangedAttack(dps, dps.findClosestByPath(enemy))
            } else {
                attack(dps, dps.findClosestByPath(enemy))
            }
        })
    } else {
        myDPS.forEach(dps => {
            dps.moveTo( getObjectsByPrototype(ScoreCollector)[0])
            // if (dps.kind == 'ranged') {
            //     // console.log(dps)
            //     rangedAttack(dps, dps.findClosestByPath(enemySpawn))
            // } else {
            //     attack(dps, dps.findClosestByPath(enemySpawn))
            // }
        })
    }
}

const thereIsAworkerHere = (pos, isUp) => {
    return workersPosition[isUp ? 'up' : 'down'].find(position => position.x == pos.x &&  position.y == pos.y && position.creep)
}

const isFuckingSpawning = (creep, spawner) => {
    return creep.spawning || !creep.id || !creep.exists || (creep.x == spawner.x && creep.y == spawner.y)
}

const workerIsInPlace = (worker, isUp) => {
    return workersPosition[isUp ? 'up' : 'down'].find(position => position.creep == worker);
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
        creep.moveTo(creepToAttack)
    }
}