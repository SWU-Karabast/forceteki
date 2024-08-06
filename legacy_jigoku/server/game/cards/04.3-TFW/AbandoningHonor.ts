import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class AbandoningHonor extends ProvinceCard {
    static id = 'abandoning-honor';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.role && context.player.role.hasTrait('fire'),
            effect: AbilityDsl.effects.modifyProvinceStrength(2)
        });

        this.interrupt({
            title: 'Choose a dishonored character',
            when: {
                onBreakProvince: (event, context) =>
                    event.card === context.source && context.player.opponent !== undefined
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isDishonored,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }
}
