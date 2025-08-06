import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait } from '../../../core/Constants';

export default class TheArmorerSurvivalIsStrength extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2560835268',
            internalName: 'the-armorer#survival-is-strength'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a shield token to each of up to 3 Mandalorian units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Mandalorian),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
