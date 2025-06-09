import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class PeliMottoIShouldChargeYouMore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3527836283',
            internalName: 'peli-motto#i-should-charge-you-more',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give an Experience token to a friendly Vehicle or Droid unit.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait([Trait.Vehicle, Trait.Droid]),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
