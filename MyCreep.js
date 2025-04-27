import { Creep } from "game/prototypes";
import { StateMachine } from './StateMachine';
import { ERR_NOT_IN_RANGE } from "game/constants";
import { WorkerState } from "./States/WorkerState";
import { HarvestState } from "./States/HarvestState";
import { RangedState } from "./States/RangedState";
import { HealerState } from "./States/HealerState";

export class MyCreep {
  constructor(creep, kind) {
    /**
     * @type {Creep}
     */
    this.creep = creep;

    this.kind = kind; // 'worker', 'harvester', 'ranged', 'healer'

    this._target = null; 
    this._targetType = null; 


    switch (kind) {
        case "worker":
            this.stateMachine = new StateMachine(this, new WorkerState());
            break;
        case "harvester":
            this.stateMachine = new StateMachine(this, new HarvestState());
            break;
        case "ranged":
            this.stateMachine = new StateMachine(this, new RangedState());
            break;
        case "healer":
            this.stateMachine = new StateMachine(this, new HealerState());
            break;
        default:
            throw new Error("Invalid creep type");
        }

  }

  get id() {
    return this.creep.id;
  }

  get exists() {
    return this.creep.exists;
  }

  get x() {
    return this.creep.x;
  }

  get y() {
    return this.creep.y;
  }

  get body() {
    return this.creep.body;
  }

  get fatigue() {
    return this.creep.fatigue;
  }

  get hits() {
    return this.creep.hits;
  }

  get hitsMax() {
    return this.creep.hitsMax;
  }

  get my() {
    return this.creep.my;
  }

  get store() {
    return this.creep.store;
  }

  get spawning() {
    return this.creep.spawning;
  }

  get target() {
    return this._target;
  }

  set target(value) {
    this._target = value;
  }

  get targetType() {
    return this._targetType;
  }

  set targetType(value) {
    this._targetType = value;
  }

  // --- Methods ---
  resetTarget() {
    this._target = null;
    this._targetType = null;
  }
  // --- Methods ---

  _attack(target) {
    return this.creep.attack(target);
  }

  build(target) {
    return this.creep.build(target);
  }

  drop(resource, amount) {
    return this.creep.drop(resource, amount);
  }

  harvest(target) {
    return this.creep.harvest(target);
  }

  _heal(target) {
    return this.creep.heal(target);
  }

  move(direction) {
    return this.creep.move(direction);
  }

  moveTo(target, options) {
    return this.creep.moveTo(target, options);
  }

  pickup(target) {
    return this.creep.pickup(target);
  }

  pull(target) {
    return this.creep.pull(target);
  }

  _rangedAttack(target) {
    return this.creep.rangedAttack(target);
  }

  _rangedHeal(target) {
    return this.creep.rangedHeal(target);
  }

  rangedMassAttack() {
    return this.creep.rangedMassAttack();
  }

  transfer(target, resource, amount) {
    return this.creep.transfer(target, resource, amount);
  }

  withdraw(target, resource, amount) {
    return this.creep.withdraw(target, resource, amount);
  }

  findClosestByPath(positions, options) {
    return this.creep.findClosestByPath(positions, options);
  }

  findClosestByRange(positions) {
    return this.creep.findClosestByRange(positions);
  }

  findInRange(positions, range) {
    return this.creep.findInRange(positions, range);
  }

  findPathTo(pos, options) {
    return this.creep.findPathTo(pos, options);
  }

  getRangeTo(pos) {
    return this.creep.getRangeTo(pos);
  }

  heal(creepToHeal) {
    if (this._heal(creepToHeal) == ERR_NOT_IN_RANGE) {
        if (this._rangedHeal(creepToHeal) == ERR_NOT_IN_RANGE) {
            this.moveTo(creepToHeal);
        }
    }
}
  follow(creepToFollow) {
          this.moveTo(creepToFollow)
  }
  rangedAttack(creepToAttack) {
      if (this._rangedAttack(creepToAttack) == ERR_NOT_IN_RANGE) {
          this.moveTo(creepToAttack);
      }
  }

  attack(creepToAttack) {
      if (this._attack(creepToAttack) == ERR_NOT_IN_RANGE) {
          this.moveTo(creepToAttack);
      }
  }
}