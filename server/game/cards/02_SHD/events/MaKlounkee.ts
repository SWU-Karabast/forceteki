import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MaKlounkee extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0931441928',
            internalName: 'ma-klounkee',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a friendly non-leader Underworld unit to its owner\'s hand',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, _context) => card.hasSomeTrait(Trait.Underworld),
                immediateEffect: AbilityHelper.immediateEffects.returnToHandFromPlay()
            },
            ifYouDo: {
                title: 'Deal 3 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}

MaKlounkee.implemented = true;