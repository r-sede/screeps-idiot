import { WorkerState } from "./States/WorkerState";
import { WorkerStaticState } from "./States/WorkerStaticState";
import { MoverState } from "./States/MoverState";
import { HarvestState } from "./States/HarvestState";
import { RangedState } from "./States/RangedState";
import { HealerState } from "./States/HealerState";

export class StateMachine {
    constructor(owner, initialState) {
        this.owner = owner;
        this.currentState = null;
        this.previousState = null;
        this.states= {};
        this.states['workerState'] = new WorkerState();
        this.states['workerStaticState'] = new WorkerStaticState();
        this.states['moverState'] = new MoverState();
        this.states['harvestState'] = new HarvestState();
        this.states['rangedState'] = new RangedState();
        this.states['healerState'] = new HealerState();

        this.changeState(initialState);

    }

    changeState(newState) {
        if (newState !== this.currentState || this.currentState === null) {
            if (this.currentState) {
                this.states[this.currentState].onExit(this.owner);
            }
            this.previousState = this.currentState;
            this.currentState = newState;
            if (this.currentState) {
                console.log('onEnter')
                this.states[this.currentState].onEnter(this.owner);
            }
        }
    }

    update() {
        if (this.currentState) {
            this.states[this.currentState].execute(this.owner);
        }
    }
}