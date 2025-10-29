import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class CorellianHounds extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1475870465',
            internalName: 'corellian-hounds',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            condition: (context) => context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena }).length === 0,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}