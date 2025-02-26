import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, RelativePlayer, ZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class SawGerreraExtremist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5555846790',
            internalName: 'saw-gerrera#extremist',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'As an additional cost for each opponent to play an event, they must deal 2 damage to their base',
            targetController: RelativePlayer.Opponent,
            sourceZoneFilter: ZoneName.GroundArena,
            ongoingEffect: OngoingEffectBuilder.player.static(EffectName.AdditionalPlayCost, (context) => {
                if (context.ability.card.isEvent()) {
                    return AbilityHelper.costs.dealDamageSpecific(2, context.player.base);
                }
                return undefined;
            })
        });
    }
}
