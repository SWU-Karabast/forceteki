import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class RoseTicoNowItsWorthIt extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rose-tico#now-its-worth-it-id',
            internalName: 'rose-tico#now-its-worth-it'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            condition: (context) => context.player.getArenaUnits().some((unit) => !unit.unique),
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}
