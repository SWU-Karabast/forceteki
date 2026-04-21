import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class GeneralGrievousCrushThem extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2292638343',
            internalName: 'general-grievous#crush-them',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+1 for each resource you control',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.controller.resources.length,
                hp: target.controller.resources.length,
            })),
        });

        registrar.addConstantAbility({
            title: 'While this unit is undamaged, he gains Sentinel',
            condition: (context) => context.source.damage === 0,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}