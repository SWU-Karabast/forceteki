import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SalaciousCrumbCacklingCompanion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'salacious-crumb#cackling-companion-id',
            internalName: 'salacious-crumb#cackling-companion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control Jabba the Hutt (as a leader or unit), this unit enters play ready',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.player.controlsLeaderUnitOrUpgradeWithTitle('Jabba the Hutt'),
                onTrue: abilityHelper.immediateEffects.ready()
            })
        });
    }
}