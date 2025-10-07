import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityRestriction } from '../../../core/Constants';

export default class TradeRouteTaxation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3776423866',
            internalName: 'trade-route-taxation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Your opponent can\'t play events for this phase',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getArenaUnits().length > context.player.opponent.getArenaUnits().length,
                onTrue: abilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                    target: context.player.opponent,
                    effect: abilityHelper.ongoingEffects.playerCannot(AbilityRestriction.PlayEvent)
                }))
            })
        });
    }
}
