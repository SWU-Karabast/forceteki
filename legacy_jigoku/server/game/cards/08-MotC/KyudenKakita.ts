import { CardTypes, Players } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class KyudenKakita extends StrongholdCard {
    static id = 'kyuden-kakita';

    setupCardAbilities() {
        this.reaction({
            title: 'Honor a Character',
            when: { onDuelFinished: () => true },
            cost: [AbilityDsl.costs.bowSelf()],
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) => context.event.duel.isInvolved(card),
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}
