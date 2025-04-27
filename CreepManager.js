// CreepManager.js

const MYCREEPS = {
    workers: [],
    movers: [],
    scoreHarvesters: [],
    army: [],
  };
  
  export function getMyCreeps() {
    return MYCREEPS;
  }
  
  export function registerCreep(creep, role) {
    switch (role) {
      case 'worker':
        MYCREEPS.workers.push(creep);
        break;
      case 'mover':
        MYCREEPS.movers.push(creep);
        break;
      case 'harvester':
        MYCREEPS.scoreHarvesters.push(creep);
        break;
      case 'ranged':
      case 'melee':
      case 'healer':
        MYCREEPS.army.push(creep);
        break;
      default:
        console.log('Unknown role:', role);
    }
  }
  
  export function cleanDeadCreeps() {
    for (const role in MYCREEPS) {
      MYCREEPS[role] = MYCREEPS[role].filter(creep => creep.exists);
    }
  }