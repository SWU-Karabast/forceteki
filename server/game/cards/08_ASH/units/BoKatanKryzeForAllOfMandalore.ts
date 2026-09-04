import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BoKatanKryzeForAllOfMandalore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4358572595',
            internalName: 'bokatan-kryze#for-all-of-mandalore',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Mandalorian} unit, this unit gains ${TextHelper.Raid(2)}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Mandalorian, context.source),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}