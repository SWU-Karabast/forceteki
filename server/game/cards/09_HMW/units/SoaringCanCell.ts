import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class SoaringCanCell extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2209630427',
            internalName: 'soaring-cancell'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control an ${TextHelper.Trait.Kashyyyk} base, this unit gains ${TextHelper.Ambush}`,
            condition: (c) => c.player.base.hasSomeTrait(Trait.Kashyyyk),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
        });
    }
}