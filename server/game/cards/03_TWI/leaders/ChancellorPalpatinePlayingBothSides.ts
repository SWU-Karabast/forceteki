import AbilityHelper from '../../../AbilityHelper';
import { DoubleSidedLeaderCard } from '../../../core/card/DoubleSidedLeaderCard';
import { Aspect } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class ChancellorPalpatinePlayingBothSides extends DoubleSidedLeaderCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '0026166404',
            internalName: 'chancellor-palpatine#playing-both-sides',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'If a friendly Heroism unit was defeated this phase, draw a card, heal 2 damage from your base, then flip this leader.',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.friendlyHeroismCardDefeatedThisPhase(context),
                onFalse: AbilityHelper.immediateEffects.noAction(),
                onTrue: AbilityHelper.immediateEffects.sequential((context) => ([
                    AbilityHelper.immediateEffects.draw(),
                    AbilityHelper.immediateEffects.heal({ target: context.player.base, amount: 2 }),
                    AbilityHelper.immediateEffects.flipDoubleSidedLeader({ target: context.source })
                ]))
            })
        });
    }

    protected override setupLeaderBackSideAbilities() {
        this.addActionAbility({
            title: 'If you played a Villainy card this phase, create a Clone Trooper, deal 2 damage to each enemy base, and then flip this leader.',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.villainyCardPlayedThisPhase(context),
                onFalse: AbilityHelper.immediateEffects.noAction(),
                onTrue: AbilityHelper.immediateEffects.sequential((context) => (
                    [
                        AbilityHelper.immediateEffects.createCloneTrooper(),
                        AbilityHelper.immediateEffects.damage({ target: context.player.opponent.base, amount: 2 }),
                        AbilityHelper.immediateEffects.flipDoubleSidedLeader({ target: context.source })
                    ]
                ))
            })
        });
    }

    private friendlyHeroismCardDefeatedThisPhase(context): boolean {
        return this.unitsDefeatedThisPhaseWatcher.someUnitDefeatedThisPhase((defeatedUnitEntry) =>
            defeatedUnitEntry.controlledBy === context.source.controller &&
            defeatedUnitEntry.unit.hasSomeAspect(Aspect.Heroism));
    }

    private villainyCardPlayedThisPhase(context): boolean {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === context.source.controller &&
            playedCardEntry.card.hasSomeAspect(Aspect.Villainy)
        );
    }
}