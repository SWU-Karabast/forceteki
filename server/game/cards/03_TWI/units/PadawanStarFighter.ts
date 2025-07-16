import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class PadawanStarFighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4718895864',
            internalName: 'padawan-starfighter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you control a Force unit or a Force upgrade, this unit gets +1/+1',
            condition: (context) => context.player.hasSomeArenaCard({ trait: Trait.Force }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
        });
    }
}
