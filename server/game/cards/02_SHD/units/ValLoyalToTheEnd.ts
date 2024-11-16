import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ValLoyalToTheEnd extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0474909987',
            internalName: 'val#loyal-to-the-end'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Give 2 Experience tokens to a friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
            }
        });

        this.addBountyAbility({
            title: 'Deal 3 damage to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}

ValLoyalToTheEnd.implemented = true;
