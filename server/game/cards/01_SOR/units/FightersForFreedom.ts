import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType } from '../../../core/Constants';

export default class FightersForFreedom extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5907868016',
            internalName: 'fighters-for-freedom'
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'When you play another aggression card: You may deal 1 damage to a base',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeAspect(Aspect.Aggression) &&
                    event.card.controller === context.source.controller &&
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

FightersForFreedom.implemented = true;
