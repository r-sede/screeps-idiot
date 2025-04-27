import { MyCreep } from "./MyCreep";
import { getGlobals } from "./GlobalsManager";
import { StructureContainer } from "game/prototypes";


export function isActive(myCreep) {
    return myCreep.creep && myCreep.exists && !myCreep.spawning;
}

export function  isFuckingSpawning(myCreep) {
    return myCreep.spawning || !myCreep.id || !myCreep.exists || (myCreep.x == getGlobals().SPAWNER.x && myCreep.y == getGlobals().SPAWNER.y)
}

export function isUp() {

    return getGlobals().SPAWNER.y < 50;
}

/**
 * Choisit le meilleur container en fonction du rapport score/distance
 * @param {MyCreep} creep - Le harvester qui cherche
 * @param {Array<StructureContainer>} containers - La liste des containers possibles
 * @returns {StructureContainer|null} - Le meilleur container trouvé, ou null
 */
export function findBestContainer(creep, containers) {
    if (!containers || containers.length === 0) return null;

    let bestContainer = null;
    let bestScore = -Infinity;

    for (const container of containers) {
        const distance = creep.getRangeTo(container);
        const score = container.store.score;

        if (distance === 0) continue; // Eviter division par zéro

        const value = score / distance; // Plus grand est meilleur

        if (value > bestScore) {
            bestScore = value;
            bestContainer = container;
        }
    }

    return bestContainer;
}