import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class WingLeader extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3443737404',
            internalName: 'wing-leader',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 2 Experience tokens to another friendly Rebel unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Rebel) && card !== this,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
            }
        });
    }
}
