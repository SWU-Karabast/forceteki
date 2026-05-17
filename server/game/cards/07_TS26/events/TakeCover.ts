import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TakeCover extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3088628219',
            internalName: 'take-cover',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addDecreaseCostAbility({
            title: `This event costs ${TextHelper.resource(1)} less to play for each friendly leader unit`,
            amount: (_, player) => player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length,
        });

        registrar.setEventAbility({
            title: 'Heal up to 3 damage from a unit and give a Shield token to it',
            immediateEffect: abilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 3,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1,
            }),
            then: (thenContext) => ({
                title: 'Give a Shield token',
                immediateEffect: abilityHelper.immediateEffects.giveShield({
                    target: thenContext.events.find((x) => x.name === EventName.OnDamageHealed).card
                })
            })
        });
    }
}