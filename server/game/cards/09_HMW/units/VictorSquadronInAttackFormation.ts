import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class VictorSquadronInAttackFormation extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'victor-squadron#in-attack-formation-id',
            internalName: 'victor-squadron#in-attack-formation',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}
