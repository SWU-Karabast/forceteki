import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class FrostbittenCrossing extends ProvinceCard {
    static id = 'frostbitten-crossing';

    setupCardAbilities() {
        this.action({
            title: 'Discard all attachments from a character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && card.attachments.length > 0
            },
            effect: 'remove all attachments from {0}',
            gameAction: AbilityDsl.actions.discardFromPlay((context) => ({
                target: context.target.attachments
            }))
        });
    }
}
