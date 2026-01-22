import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class BlackSunCabalist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3080000065',
            internalName: 'black-sun-cabalist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to another friendly Underworld unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Underworld) && card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}