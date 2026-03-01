import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class BlackSunCabalist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3080000065',
            internalName: 'black-sun-cabalist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to another friendly Underworld unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Underworld),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}