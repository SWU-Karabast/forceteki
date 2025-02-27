import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait } from '../../../core/Constants';

export default class TheArmorerSurvivalIsStrength extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2560835268',
            internalName: 'the-armorer#survival-is-strength'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Gain a shield token to each of up to 3 Mandalorian units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Mandalorian),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
