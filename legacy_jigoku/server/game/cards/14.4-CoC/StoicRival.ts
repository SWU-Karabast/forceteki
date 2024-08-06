import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class StoicRival extends DrawCard {
    static id = 'stoic-rival';

    setupCardAbilities() {
        this.action({
            title: 'Dishonor a participating character with fewer attachments',
            condition: (context) => context.source.attachments.length > 0 && context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) =>
                    card.isParticipating() && card.attachments.length < context.source.attachments.length,
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}
