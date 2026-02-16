import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { Trait } from '../../../core/Constants';

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
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                maxTargets: 1,
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'If it survives, heal damage from your base equal to the damage dealt this way',
                ifYouDoCondition: () => ifYouDoContext.events[0].totalDistributed > 0 && !ifYouDoContext.events[1].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: ifYouDoContext.events[0].totalDistributed, target: ifYouDoContext.player.base })
            })
        });
    }
}