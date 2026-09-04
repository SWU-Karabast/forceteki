import { ReplacementEffectContext } from '../../ability/ReplacementEffectContext';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type { Card } from '../../card/Card';
import type { IUnitCard } from '../../card/propertyMixins/UnitProperties';
import { AbilityType, EventName, SubStepCheck } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type { Game } from '../../Game';
import { TriggerWindowBase } from './TriggerWindowBase';
import type Shield from '../../../cards/01_SOR/tokens/Shield';
import type { GameEvent } from '../../event/GameEvent';
import type { PlayerOrCardAbility } from '../../ability/PlayerOrCardAbility';

export class ReplacementEffectWindow extends TriggerWindowBase {
    // starts as true so that we will do the trigger cleanup and initial prompt setup on the first pass
    private newReplacementEvents = true;

    /**
     * Shield triggers that were consolidated out (we keep at most one per unit in `unresolved`), retained here so that
     * if the kept trigger's shield is consumed by another effect we can re-select a still-valid alternate. Keyed by the
     * shielded unit's `uuid`.
     */
    private stashedShieldTriggers = new Map<string, TriggeredAbilityContext<Shield>[]>();

    public constructor(
        game: Game,
        eventWindow?: EventWindow
    ) {
        super(game, AbilityType.ReplacementEffect, eventWindow);
    }

    // TODO: this is kind of hacky right now until we fully replace the resolution ordering rules
    // from the standard triggered ability window with the correct ones for replacement effects
    public override continue(): boolean {
        if (this.newReplacementEvents) {
            this.emitEvents();
        }

        const result = super.continue();

        this.newReplacementEvents = false;

        return result;
    }

    public override shouldCleanUpTriggers(): boolean {
        if (this.newReplacementEvents) {
            return true;
        }

        // If a shield trigger we previously kept has become invalid (its shield was consumed by another effect that
        // resolved this window, e.g. The Mandalorian's ability defeating a shield) and we have a stashed alternate,
        // force a cleanup pass so `consolidateShieldTriggers` can swap in the still-valid shield trigger.
        if (this.stashedShieldTriggers.size === 0) {
            return false;
        }

        for (const triggeredAbilities of this.unresolved.values()) {
            for (const triggeredAbility of triggeredAbilities) {
                if (triggeredAbility.source.isShield() && !triggeredAbility.ability.hasAnyLegalEffects(triggeredAbility, SubStepCheck.All)) {
                    return true;
                }
            }
        }

        return false;
    }

    public addReplacementEffectEvent(event: any) {
        this.triggeringEvents.push(event);
        this.newReplacementEvents = true;
    }

    public override addTriggeredAbilityToWindow(context: TriggeredAbilityContext) {
        const replacedAbilities = this.getAllReplacedAbilities(context, context.event);

        if (replacedAbilities.has(context.ability)) {
            return;
        }

        super.addTriggeredAbilityToWindow(context);
    }

    private getAllReplacedAbilities(context: TriggeredAbilityContext, event: GameEvent): Set<PlayerOrCardAbility> {
        const replacedAbilities = new Set<PlayerOrCardAbility>();

        let currentEvent = event;
        while (currentEvent.isReplacementEvent) {
            if (currentEvent.context.ability === context.ability) {
                replacedAbilities.add(currentEvent.context.ability);
            }
            currentEvent = currentEvent.replacesEvent;
        }

        return replacedAbilities;
    }

    protected override cleanUpTriggers(): void {
        super.cleanUpTriggers();

        this.consolidateShieldTriggers();
    }

    // TODO: since this is still using the ordering rules from the standard triggered ability window, currently there is a bug
    // with shields owned by the same player on different units. the player will be prompted to order resolution even though it
    // doesn't matter (or they may not even technically control the effect). See Lom Pyke tests for an example.
    /**
     * If there are multiple Shield triggers present, consolidate down to one per unit to reduce prompt noise.
     * Will choose the Shield to trigger, prioritizing any that have {@link Shield.highPriorityRemoval}` = true`.
     *
     * The triggers that are not selected are not discarded but stashed in {@link stashedShieldTriggers}, so that if the
     * selected shield is later consumed by another effect (e.g. The Mandalorian, Devoted Rescuer defeating a shield for
     * a different unit) we can re-select a still-valid alternate on a subsequent pass instead of losing the prevention.
     */
    private consolidateShieldTriggers() {
        // gather every shield trigger we currently know about: those still in `unresolved` plus any previously stashed
        const allShieldTriggers: TriggeredAbilityContext<Shield>[] = Array.from(this.stashedShieldTriggers.values()).flat();
        for (const triggeredAbilities of this.unresolved.values()) {
            for (const triggeredAbility of triggeredAbilities) {
                if (triggeredAbility.source.isShield()) {
                    allShieldTriggers.push(triggeredAbility as TriggeredAbilityContext<Shield>);
                }
            }
        }

        if (allShieldTriggers.length === 0) {
            return;
        }

        // only consider triggers whose shield can still actually be defeated (skips shields already consumed or whose
        // damage event was already replaced). This also guarantees `source.parentCard` is safe to access below.
        const validShieldTriggers = allShieldTriggers.filter((trigger) => trigger.ability.hasAnyLegalEffects(trigger, SubStepCheck.All));

        // select at most 1 shield trigger per unit, preferring highPriorityRemoval shields
        const selectedShieldEffectPerUnit = new Map<Card, TriggeredAbilityContext<Shield>>();
        for (const triggeredAbility of validShieldTriggers) {
            const shieldedUnit = triggeredAbility.source.parentCard;
            const currentlySelectedShieldEffect = selectedShieldEffectPerUnit.get(shieldedUnit);

            if (
                currentlySelectedShieldEffect == null ||
                (triggeredAbility.source.highPriorityRemoval && !currentlySelectedShieldEffect.source.highPriorityRemoval)
            ) {
                selectedShieldEffectPerUnit.set(shieldedUnit, triggeredAbility);
            }
        }

        const selectedShieldEffects = new Set(selectedShieldEffectPerUnit.values());

        // rebuild `unresolved`: strip all shield triggers, keeping any selected ones in their original position
        for (const [player, triggeredAbilities] of this.unresolved) {
            this.unresolved.set(player, triggeredAbilities.filter((ability) =>
                !ability.source.isShield() ||
                selectedShieldEffects.has(ability as TriggeredAbilityContext<Shield>)
            ));
        }

        // add any selected trigger that came from the stash (not already present in `unresolved`)
        for (const selected of selectedShieldEffects) {
            const playerAbilities = this.unresolved.get(selected.player) ?? [];
            if (!playerAbilities.includes(selected)) {
                playerAbilities.push(selected);
                this.unresolved.set(selected.player, playerAbilities);
            }
        }

        // stash the valid-but-not-selected alternates for potential later re-selection, keyed by shielded unit
        this.stashedShieldTriggers = new Map<string, TriggeredAbilityContext<Shield>[]>();
        for (const trigger of validShieldTriggers) {
            if (selectedShieldEffects.has(trigger)) {
                continue;
            }

            const unitId = trigger.source.parentCard.uuid;
            const stashedForUnit = this.stashedShieldTriggers.get(unitId) ?? [];
            stashedForUnit.push(trigger);
            this.stashedShieldTriggers.set(unitId, stashedForUnit);
        }
    }

    /**
     * Helper method to get the shields attached to `unit` that are still legal targets for a defeat effect, i.e. still attached and
     * not already the target of a defeat event queued in this window's originating {@link EventWindow}.
     *
     * Used by effects (e.g. The Mandalorian, Devoted Rescuer) that need to defeat a shield without colliding with a
     * shield already claimed by another pending replacement effect in the same window.
     */
    public getShieldsNotQueuedForDefeat(unit: IUnitCard): Shield[] {
        const shields = unit.upgrades.filter((upgrade): upgrade is Shield => upgrade.isShield());

        if (shields.length === 0) {
            return [];
        }

        const cardsQueuedForDefeat = this.getCardsQueuedForDefeat();
        return shields.filter((shield) => !cardsQueuedForDefeat.has(shield));
    }

    private getCardsQueuedForDefeat(): Set<Card> {
        const cardsQueuedForDefeat = new Set<Card>();

        if (!this.eventWindow) {
            return cardsQueuedForDefeat;
        }

        for (const event of this.eventWindow.events) {
            if (event.name === EventName.OnCardDefeated && !event.isCancelledOrReplaced && event.card) {
                cardsQueuedForDefeat.add(event.card);
            }
        }

        return cardsQueuedForDefeat;
    }

    protected resolveAbility(context: TriggeredAbilityContext) {
        const replacementEffectContext = new ReplacementEffectContext({
            ...context.getProps(),
            replacementEffectWindow: this
        });

        const resolver = this.game.resolveAbility(replacementEffectContext);

        this.game.queueSimpleStep(() => {
            if (resolver.resolutionCommitted) {
                this.postResolutionUpdate(resolver);
            }
        }, `Check resolution of replacement effect ${resolver.context.ability}`);
    }

    public override toString() {
        return `'ReplacementEffectWindow: ${this.triggeringEvents.map((event) => event.name).join(', ')}'`;
    }
}
