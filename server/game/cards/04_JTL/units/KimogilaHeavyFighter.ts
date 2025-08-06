import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, TargetMode } from '../../../core/Constants';

export default class KimogilaHeavyFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6757031085',
            internalName: 'kimogila-heavy-fighter',
        };
    }

    private filterUnitsDamagedThatCanBeExhausted(events) {
        return events
            .filter((event) => event.name === EventName.OnDamageDealt)
            .filter((event) => event.card.canBeExhausted())
            .map((event) => event.card);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 3 indirect damage to a player',
            when: {
                whenPlayed: true,
            },
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 3 })
            },
            then: (thenContext) => ({
                title: 'Exhaust each unit damaged this way.',
                thenCondition: () => this.filterUnitsDamagedThatCanBeExhausted(thenContext.events).length > 0,
                immediateEffect: AbilityHelper.immediateEffects.exhaust({
                    target: this.filterUnitsDamagedThatCanBeExhausted(thenContext.events),
                })
            })
        });
    }
}
