import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class SalaciousCrumbCacklingCompanion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'salacious-crumb#cackling-companion-id',
            internalName: 'salacious-crumb#cackling-companion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'If you control Jabba the Hutt (as a leader or unit), this unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Jabba the Hutt'),
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}
