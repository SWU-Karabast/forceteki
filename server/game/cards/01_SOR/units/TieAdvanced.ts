import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class TieAdvanced extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4092697474',
            internalName: 'tie-advanced',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 2 Experience tokens to a friendly Imperial unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Imperial) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
            }
        });
    }
}
