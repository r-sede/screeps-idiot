import { Creep } from "game/prototypes";
import { CONSTANTS } from "./main.mjs";
/**
 * Vérifie si un creep est vivant et prêt à agir  
 * @param {Creep} creep - Le creep à tester
 * @returns {boolean} - true si le creep existe et n'est pas en train de spawn
 */
export function isActive(creep) {
    return creep && creep.exists && !creep.spawning;
}

/**
 * Vérifie si un creep est en train d'etre spawne 
 * @param {Creep} creep - Le creep à tester
 * @returns {boolean} - true si le creep est train de spawn
 */

const isFuckingSpawning = (creep) => {
    return creep.spawning || !creep.id || !creep.exists || (creep.x == CONSTANTS.SPAWNER.x && creep.y == CONSTANTS.SPAWNER.y)
}