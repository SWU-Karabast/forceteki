import type { Elements } from '../../Constants';
import { RoleCard } from '../../RoleCard';
import AbilityDsl from '../../abilitydsl';
import type { Conflict } from '../../conflict';

export function createKeeperRole(id: string, element: Elements) {
    return class KeeperRole extends RoleCard {
        static id = id;

        setupCardAbilities() {
            this.reaction({
                title: 'Gain 1 fate',
                when: {
                    afterConflict: (event, context) =>
                        (event.conflict as Conflict).elements.some((element: Elements) => this.hasTrait(element)) &&
                        event.conflict.winner === context.player &&
                        event.conflict.defendingPlayer === context.player
                },
                gameAction: AbilityDsl.actions.gainFate()
            });
        }

        getElement() {
            return [element];
        }
    };
}

export function createSeekerRole(id: string, element: Elements) {
    return class SeekerRole extends RoleCard {
        static id = id;

        setupCardAbilities() {
            this.reaction({
                title: 'Gain 1 fate',
                when: {
                    onCardRevealed: (event, context) =>
                        event.card.controller === context.player &&
                        event.card.isProvince &&
                        event.card.getElement().some((element: Elements) => context.source.hasTrait(element))
                },
                gameAction: AbilityDsl.actions.gainFate()
            });
        }

        getElement() {
            return [element];
        }
    };
}
