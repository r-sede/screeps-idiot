import { MyCreep } from "./MyCreep";
import { getGlobals } from "./GlobalsManager";


export function isActive(myCreep) {
    return myCreep.creep && myCreep.exists && !myCreep.spawning;
}

export function  isFuckingSpawning(myCreep) {
    return myCreep.spawning || !myCreep.id || !myCreep.exists || (myCreep.x == getGlobals().SPAWNER.x && myCreep.y == getGlobals().SPAWNER.y)
}

export function isUp() {

    return getGlobals().SPAWNER.y < 50;
}