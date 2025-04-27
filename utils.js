import { MyCreep } from "./MyCreep";
import { getGlobals } from "./GlobalsManager";
/**
 * Vérifie si un creep est vivant et prêt à agir 
 * @param {MyCreep} myCreep - Le creep à tester
 * @returns {boolean} - true si le creep existe et n'est pas en train de spawn
 */
export function isActive(myCreep) {
    return myCreep.creep && myCreep.exists && !myCreep.spawning;
}

/**
 * Vérifie si un creep est en train d'etre spawne 
 * @param {MyCreep} myCreep - Le creep à tester
 * @returns {boolean} - true si le creep est train de spawn
 */

const isFuckingSpawning = (myCreep) => {
    return myCreep.spawning || !myCreep.id || !myCreep.exists || (myCreep.x == getGlobals().SPAWNER.x && myCreep.y == getGlobals().SPAWNER.y)
}


/**
 * Détermine si ton spawn est en haut ou en bas de la map.
 * @returns {boolean} - true si tu a spawn en haut de la map, false sinon.
 */
export function isUp() {

    return getGlobals().SPAWNER.y < 50;
}