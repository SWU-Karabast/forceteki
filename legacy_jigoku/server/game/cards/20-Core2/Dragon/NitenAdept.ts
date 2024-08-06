import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class NitenAdept extends DrawCard {
    static id = 'niten-adept';

    setupCardAbilities() {
        this.action({
            title: 'Bow character',
            condition: (context) => context.source.attachments.length > 0 && context.source.isParticipating(),
            cost: AbilityDsl.costs.bow({
                cardType: CardTypes.Attachment,
                cardCondition: (card, context) => card.parent === context.source
            }),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && card.attachments.length === 0,
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
