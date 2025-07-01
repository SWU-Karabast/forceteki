import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Trait } from '../../../core/Constants';

export default class LadyProximaWhiteWormMatriarch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0981852103',
            internalName: 'lady-proxima#white-worm-matriarch',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Deal 1 damage to a base.',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeTrait(Trait.Underworld) &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            }
        });
    }
}
