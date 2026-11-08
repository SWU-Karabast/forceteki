import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class NuteGunrayRingRingSpaceCalling extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1027393252',
            internalName: 'nute-gunray#ring-ring-space-calling',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly ${TextHelper.Trait.Separatist} unit gains ${TextHelper.Restore(1)}`,
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source && card.hasSomeTrait(Trait.Separatist),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}
