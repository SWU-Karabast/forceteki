import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GungaCityGuards extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'gunga-city-guards-id',
            internalName: 'gunga-city-guards',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Gungan} unit or a ${TextHelper.Trait.Naboo} base, this unit gains ${TextHelper.Shielded}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Gungan, context.source) || context.player.base.hasSomeTrait(Trait.Naboo),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded)
        });
    }
}