import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GrandArmyMarine extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-army-marine-id',
            internalName: 'grand-army-marine',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Give a Shield token to a friendly ${TextHelper.Trait.Gungan} unit`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Gungan),
                immediateEffect: abilityHelper.immediateEffects.giveShield()
            }
        });
    }
}