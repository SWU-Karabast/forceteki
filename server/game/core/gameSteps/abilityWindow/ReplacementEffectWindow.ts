import { ReplacementEffectContext } from '../../ability/ReplacementEffectContext';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type Game from '../../Game';
import type Player from '../../Player';
import { TriggerWindowBase } from './TriggerWindowBase';
import type Shield from '../../../cards/01_SOR/tokens/Shield';

export class ReplacementEffectWindow extends TriggerWindowBase {
    // starts as true so that we will do the trigger cleanup and initial prompt setup on the first pass
    private newReplacementEvents = true;

    public constructor(
        game: Game,
        eventWindow: EventWindow
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
        return this.newReplacementEvents;
    }

    public addReplacementEffectEvent(event: any) {
        this.triggeringEvents.push(event);
        this.newReplacementEvents = true;
    }

    public override addTriggeredAbilityToWindow(context: TriggeredAbilityContext) {
        const replacement = context.event.findEventInReplacements();
        if (replacement && replacement.context.ability === context.ability) {
            return;
        }
        super.addTriggeredAbilityToWindow(context);
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
     * Will randomly choose the Shield to trigger, prioritizing any that have {@link Shield.highPriorityRemoval}` = true`.
     */
    private consolidateShieldTriggers() {
        // pass 1: go through all triggers and select at most 1 shield effect per unit with shield(s)
        const selectedShieldEffectPerUnit = new Map<Card, TriggeredAbilityContext<Shield>>();
        for (const [_player, triggeredAbilities] of this.unresolved) {
            for (const triggeredAbility of triggeredAbilities) {
                const abilitySource = triggeredAbility.source;

                if (abilitySource.isShield()) {
                    const shieldedUnit = abilitySource.parentCard;

                    const currentlySelectedShieldEffect = selectedShieldEffectPerUnit.get(shieldedUnit);

                    // if there's currently no selected shield effect, or the new one is higher priority, set it as the shield effect to resolve for this unit
                    if (
                        currentlySelectedShieldEffect == null ||
                        (abilitySource.highPriorityRemoval && !currentlySelectedShieldEffect.source.highPriorityRemoval)
                    ) {
                        selectedShieldEffectPerUnit.set(shieldedUnit, (triggeredAbility as TriggeredAbilityContext<Shield>));
                    }
                }
            }
        }

        // pass 2: go through all triggers and filter out all shield effects other than those selected in pass 1
        if (selectedShieldEffectPerUnit.size !== 0) {
            const selectedShieldEffectsFlat = new Set(Array.from(selectedShieldEffectPerUnit.values()).flat());
            const postConsolidateUnresolved = new Map<Player, TriggeredAbilityContext[]>();

            for (const [player, triggeredAbilities] of this.unresolved) {
                const postConsolidateAbilities = triggeredAbilities.filter((ability) =>
                    !ability.source.isShield() ||
                    selectedShieldEffectsFlat.has(ability as TriggeredAbilityContext<Shield>)
                );

                postConsolidateUnresolved.set(player, postConsolidateAbilities);
            }

            this.unresolved = postConsolidateUnresolved;
        }
    }

    protected resolveAbility(context: TriggeredAbilityContext) {
        const replacementEffectContext = new ReplacementEffectContext({
            ...context.getProps(),
            replacementEffectWindow: this
        });

        const resolver = this.game.resolveAbility(replacementEffectContext);

        this.game.queueSimpleStep(() => {
            if (resolver.resolutionComplete) {
                this.postResolutionUpdate(resolver);
            }
        }, `Check resolution of replacement effect ${resolver.context.ability}`);
    }

    public override toString() {
        return `'ReplacementEffectWindow: ${this.triggeringEvents.map((event) => event.name).join(', ')}'`;
    }
}
