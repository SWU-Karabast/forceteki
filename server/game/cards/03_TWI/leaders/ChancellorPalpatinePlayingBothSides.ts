import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IDoubleSidedLeaderAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { DoubleSidedLeaderCard } from '../../../core/card/DoubleSidedLeaderCard';
import { Aspect } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class ChancellorPalpatinePlayingBothSides extends DoubleSidedLeaderCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '0026166404',
            internalName: 'chancellor-palpatine#playing-both-sides',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: IDoubleSidedLeaderAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `If a friendly ${TextHelper.Heroism} unit was defeated this phase, draw a card, heal 2 damage from your base, then flip this leader.`,
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.friendlyHeroismCardDefeatedThisPhase(context),
                onTrue: AbilityHelper.immediateEffects.sequential((context) => ([
                    AbilityHelper.immediateEffects.draw(),
                    AbilityHelper.immediateEffects.heal({ target: context.player.base, amount: 2 }),
                    AbilityHelper.immediateEffects.flipDoubleSidedLeader()
                ]))
            })
        });
    }

    protected override setupLeaderBackSideAbilities(registrar: IDoubleSidedLeaderAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `If you played a ${TextHelper.Villainy} card this phase, create a Clone Trooper, deal 2 damage to each enemy base, and then flip this leader.`,
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.villainyCardPlayedThisPhase(context),
                onTrue: AbilityHelper.immediateEffects.sequential((context) => (
                    [
                        AbilityHelper.immediateEffects.createCloneTrooper(),
                        AbilityHelper.immediateEffects.damage({ target: context.player.opponent.base, amount: 2 }),
                        AbilityHelper.immediateEffects.flipDoubleSidedLeader()
                    ]
                ))
            })
        });
    }

    private friendlyHeroismCardDefeatedThisPhase(context): boolean {
        return this.cardsDefeatedThisPhaseWatcher.someUnitDefeatedThisPhase((entry) =>
            entry.controlledBy === context.player &&
            entry.card.hasSomeAspect(Aspect.Heroism));
    }

    private villainyCardPlayedThisPhase(context): boolean {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === context.player &&
            playedCardEntry.card.hasSomeAspect(Aspect.Villainy)
        );
    }
}
