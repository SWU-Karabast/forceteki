import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KelleranBeqWhereAreTheOthers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2037046615',
            internalName: 'kelleran-beq#where-are-the-others',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each other unit with 0 power',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((_, context) => {
                const zeroPowerUnitsCount = context.game.getArenaUnits({
                    condition: (c) => c.isUnit() && c.getPower() === 0,
                    otherThan: context.source
                }).length;

                return { power: zeroPowerUnitsCount, hp: 0 };
            })
        });
    }
}
