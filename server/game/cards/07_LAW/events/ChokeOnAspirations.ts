import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, MetaEventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { Trait } from '../../../core/Constants';

export default class ChokeOnAspirations extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2845024854',
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
            ifYouDo: (ifYouDoContext) => {
                // Choosing no unit makes no damage event, so the events are found by what they are, not by their index
                const distributeEvent = ifYouDoContext.events.find((event) => event.name === MetaEventName.DistributeDamage);
                const damageEvent = ifYouDoContext.events.find((event) => event.name === EventName.OnDamageDealt);
                return {
                    title: 'If it survives, heal damage from your base equal to the damage dealt this way',
                    ifYouDoCondition: () => damageEvent != null && !damageEvent.willDefeat,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: distributeEvent?.totalDistributed ?? 0, target: ifYouDoContext.player.base })
                };
            }
        });
    }
}