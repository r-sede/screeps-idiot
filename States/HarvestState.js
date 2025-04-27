import { State } from './State';

export class HarvestState extends State {
    onEnter(creep) {
        console.log(`${creep.creep.id} => Start Harvesting`);
    }

    execute(creep) {
        if (creep.creep.store.getFreeCapacity() === 0) {
            creep.stateMachine.changeState(new DepositState());
        } else {
            creep.harvestNearestSource();
        }
    }

    onExit(creep) {
        console.log(`${creep.creep.id} => Stop Harvesting`);
    }
}

export class DepositState extends State {
    onEnter(creep) {
        console.log(`${creep.creep.id} => Start Depositing`);
    }

    execute(creep) {
        if (creep.creep.store.getUsedCapacity() === 0) {
            creep.stateMachine.changeState(new HarvestState());
        } else {
            creep.depositToNearestStructure();
        }
    }

    onExit(creep) {
        console.log(`${creep.creep.id} => Stop Depositing`);
    }
}