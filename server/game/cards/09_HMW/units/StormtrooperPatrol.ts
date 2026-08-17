import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class StormtrooperPatrol extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'stormtrooper-patrol-id',
            internalName: 'stormtrooper-patrol',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another unit that costs 3 or more, this unit gets +2/+0',
            condition: (c) => c.player.hasSomeArenaUnit({ condition: (u) => u.isUnit() && u.cost >= 3, otherThan: c.source }),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}