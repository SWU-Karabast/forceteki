import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class RotundaSenateGuards extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'rotunda-senate-guards-id',
            internalName: 'rotunda-senate-guards',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is undamaged, it gains Sentinel',
            condition: (context) => context.source.damage === 0,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
