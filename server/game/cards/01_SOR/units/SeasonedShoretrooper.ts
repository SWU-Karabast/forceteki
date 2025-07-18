import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SeasonedShoretrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3988315236',
            internalName: 'seasoned-shoretrooper'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control 6 or more resources, this unit gets +2/+0',
            matchTarget: (card, context) => card === context.source,
            condition: (context) => context.player.resources.length >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
