import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class SupremacyOfUnimaginableSize extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'supremacy#of-unimaginable-size-id',
            internalName: 'supremacy#of-unimaginable-size',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly Vehicle units gets +6/+6',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Vehicle),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 6, hp: 6 })
        });
    }
}