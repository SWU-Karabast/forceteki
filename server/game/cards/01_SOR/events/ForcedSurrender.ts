import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class ForcedSurrender extends EventCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5871074103',
            internalName: 'forced-surrender',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw 2 cards. Each opponent whose base you’ve damaged this phase discards 2 cards from their hand.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.draw({ amount: 2 }),
                AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: [
                        ...new Set(
                            this.damageDealtThisPhaseWatcher.getDamageDealtByPlayer(
                                context.source.controller,
                                (damage) => damage.target.isBase() && damage.target.controller !== context.source.controller
                            ).map((damage) => damage.target.controller)
                        )
                    ],
                    amount: 2
                }))
            ]),
        });
    }
}
