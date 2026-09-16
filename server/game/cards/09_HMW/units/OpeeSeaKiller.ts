import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class OpeeSeaKiller extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'opee-sea-killer-id',
            internalName: 'opee-sea-killer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control a ${TextHelper.Trait.Naboo} base, this unit gains ${TextHelper.Grit}`,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Naboo),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}