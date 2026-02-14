import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ChokeOnAspirations extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'choke-on-aspirations-id',
            internalName: 'choke-on-aspirations',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Deal up to 5 damage to a friendly unit',
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 5,
                canDistributeLess: true,
                controller: RelativePlayer.Self,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1,
            }),
            then: (thenContext) => ({
                title: 'If it survives, heal damage from your base equal to the damage dealt this way',
                thenCondition: () => thenContext.events[0].totalDistributed > 0 && !thenContext.events[1].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: thenContext.events[0].totalDistributed, target: thenContext.player.base })
            })
        });
    }
}