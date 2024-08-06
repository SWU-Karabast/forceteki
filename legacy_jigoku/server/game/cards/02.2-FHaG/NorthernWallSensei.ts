import { CardTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class NorthernWallSensei extends DrawCard {
    static id = 'northern-wall-sensei';

    setupCardAbilities() {
        this.action({
            title: 'Grant immunity to events',
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating() && card.attachments.length > 0,
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.immunity({ restricts: 'events' })
                })
            },
            effect: 'grant immunity to events to {0}'
        });
    }
}
