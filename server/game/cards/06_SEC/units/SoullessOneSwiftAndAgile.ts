import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class SoullessOneSwiftAndAgile extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3595837658',
            internalName: 'soulless-one#swift-and-agile',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Cunning, Aspect.Cunning, Aspect.Villainy];
        registrar.addOnAttackAbility({
            title: TextHelper.performReplacements(`Disclose ${TextHelper.aspectList(aspects)} to ready 2 resources`),
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Ready 2 resources',
                immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 2 })
            }
        });
    }
}