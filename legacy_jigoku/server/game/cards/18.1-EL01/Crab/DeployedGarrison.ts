import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes } from '../../../Constants';
import type { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import type { Conflict } from '../../../conflict';
import DrawCard from '../../../drawcard';

export default class DeployedGarrison extends DrawCard {
    static id = 'deployed-garrison';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'applyCovert',
                restricts: 'opponentsCardEffects'
            })
        });

        this.reaction({
            title: 'Does not bow at the end of the conflict',
            when: {
                afterConflict: (event, context) =>
                    context.player.isDefendingPlayer() &&
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    this.#conflictNearHolding(context)
            },
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source,
                effect: AbilityDsl.effects.doesNotBow()
            })),
            effect: 'not bow during the conflict resolution'
        });
    }

    #conflictNearHolding(context: AbilityContext) {
        if (!context.player.isDefendingPlayer()) {
            return false;
        }

        const attackedProvinces = (context.game.currentConflict as Conflict).getConflictProvinces();
        const nearbyProvinces: ProvinceCard[] = context.player.getProvinces((province: ProvinceCard) => {
            for (const attackedProvince of attackedProvinces) {
                if (
                    attackedProvince === province ||
                    context.player.areLocationsAdjacent(attackedProvince.location, province.location)
                ) {
                    return true;
                }
            }
            return false;
        });

        for (const province of nearbyProvinces) {
            for (const card of context.player.getDynastyCardsInProvince(province.location) as BaseCard[]) {
                if (card.isFaceup() && card.type === CardTypes.Holding) {
                    return true;
                }
            }
        }

        return false;
    }
}
