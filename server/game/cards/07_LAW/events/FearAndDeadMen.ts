import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { ZoneName } from '../../../core/Constants';
import type { CardsDiscardedThisPhaseWatcher } from '../../../stateWatchers/CardsDiscardedThisPhaseWatcher';

export default class FearAndDeadMen extends EventCard {
    private cardsDiscardedThisPhaseWatcher: CardsDiscardedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '1416777483',
            internalName: 'fear-and-dead-men',
        };
    }

    protected override setupStateWatchers (_, abilityHelper: IAbilityHelper): void {
        this.cardsDiscardedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDiscardedThisPhase();
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'This card costs 1 resource less to play for each card discarded from your hand this phase',
            amount: (_, player) => this.cardsDiscardedThisPhaseWatcher.getCurrentValue().filter((x) => x.discardedFromPlayer === player && x.discardedFromZone === ZoneName.Hand).length,
        });

        registrar.setEventAbility({
            title: 'Deal 4 damage to each enemy ground unit',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 4,
                target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena }),
            }))
        });
    }
}