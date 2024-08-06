import { CardTypes, Locations, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type Ring from '../../../ring';
import type { AbilityContext } from '../../../AbilityContext';

export default class OnsenQuarters extends ProvinceCard {
    static id = 'onsen-quarters';

    public setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            condition: () => true,
            match: (card, context) =>
                card.type === CardTypes.Province && card !== context.source && card.controller === context.player,
            effect: AbilityDsl.effects.modifyProvinceStrength(1)
        });

        this.reaction({
            title: 'Resolve the ring effect',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.player &&
                    event.conflict.getConflictProvinces().some((a: ProvinceCard) => a === context.source)
            },
            gameAction: AbilityDsl.actions.resolveRingEffect((context) => ({
                target: this.#ringForRole(context),
                player: context.player
            }))
        });
    }

    #ringForRole(context: AbilityContext): Ring | undefined {
        for (const trait of context.player.role.traits) {
            if (trait in context.game.rings) {
                return context.game.rings[trait];
            }
        }
    }
}