import { RESOURCE_SCORE } from 'arena/season_beta/collect_and_control/basic';
import { getMyCreeps } from '../CreepManager';
import { getGlobals } from '../GlobalsManager';
import { isActive } from '../utils';
import { State } from './State';
import { ERR_NOT_IN_RANGE } from 'game/constants';

export class HarvestState extends State {
    onEnter(creep) {
        console.log(`${creep.id} => Start Harvesting`);
    }

    execute(creep) {
        if (!isActive(creep)) { return; }

        const GLOBALS = getGlobals();
        const MYCREEPS = getMyCreeps();

        if (!GLOBALS.SCORECOLLECTOR) {
            console.log(`No score collector available for Harvester ${creep.id}`);
            return;
        }

        // --- Vérification de la validité de la cible actuelle ---
        if (creep.target) {
            if (!creep.target.exists || creep.target.store[RESOURCE_SCORE] === 0) {
                // Target détruit ou vidé -> reset
                creep.resetTarget();
            }
        }

        // --- Choix ou rechoix d'une cible ---
        if (!creep.target) {
            const containers = GLOBALS.CONTAINERS;

            if (!containers || containers.length === 0) {
                console.log(`No containers found for Harvester ${creep.id}`);
                return;
            }

            // Compter combien de harvesters ciblent chaque container
            const containerTargetCount = {};
            MYCREEPS.scoreHarvesters.forEach(h => {
                if (h.target) {
                    containerTargetCount[h.target.id] = (containerTargetCount[h.target.id] || 0) + 1;
                }
            });

            // Ne prendre que les containers pas encore ciblés par plus de 2 harvesters
            const availableContainers = containers
                .filter(container => (containerTargetCount[container.id] || 0) < 2)
                .sort((a, b) => b.store[RESOURCE_SCORE] - a.store[RESOURCE_SCORE]); // Trie par quantité décroissante de score

            let chosenContainer = null;
            if (availableContainers.length > 0) {
                chosenContainer = creep.findClosestByPath(availableContainers);
            } else {
                // Tous saturés -> prendre malgré tout le plus proche de tous les containers
                const sortedAllContainers = containers.sort((a, b) => b.store[RESOURCE_SCORE] - a.store[RESOURCE_SCORE]);
                chosenContainer = creep.findClosestByPath(sortedAllContainers);
            }

            if (chosenContainer) {
                creep.target = chosenContainer;
                creep.targetType = 'container';
            }
        }

        if (!creep.target) {
            console.log(`Harvester ${creep.id} has no valid target`);
            return;
        }

        // --- Travail Harvesting/Transfert ---
        if (creep.store.getFreeCapacity(RESOURCE_SCORE) > 0) {
            if (creep.withdraw(creep.target, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.target);
            }
        } else {
            if (creep.transfer(GLOBALS.SCORECOLLECTOR, RESOURCE_SCORE) === ERR_NOT_IN_RANGE) {
                creep.moveTo(GLOBALS.SCORECOLLECTOR);
            }
        }
    }

    onExit(creep) {
        console.log(`${creep.id} => Stop Harvesting`);
    }
}
