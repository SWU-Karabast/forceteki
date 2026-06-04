import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MandalorianSuperCommandos extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3523847566',
            internalName: 'mandalorian-super-commandos'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control a leader unit, this unit gets +2/+0',
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (c) => c.isLeaderUnit() }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
