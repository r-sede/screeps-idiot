export class StateMachine {
    constructor(owner, initialState) {
        this.owner = owner;
        this.currentState = null;
        this.previousState = null;
        this.changeState(initialState);
    }

    changeState(newState) {
        if (newState !== this.currentState) {
            if (this.currentState) {
                this.currentState.onExit(this.owner);
            }
            this.previousState = this.currentState;
            this.currentState = newState;
            if (this.currentState) {
                this.currentState.onEnter(this.owner);
            }
        }
    }

    update() {
        if (this.currentState) {
            this.currentState.execute(this.owner);
        }
    }
}