import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class BoKatanKryzeForAllOfMandalore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bokatan-kryze#for-all-of-mandalore-id',
            internalName: 'bokatan-kryze#for-all-of-mandalore',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Mandalorian unit, this unit gains Raid 2',
            condition: (context) => context.player.isTraitInPlay(Trait.Mandalorian, context.source),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}