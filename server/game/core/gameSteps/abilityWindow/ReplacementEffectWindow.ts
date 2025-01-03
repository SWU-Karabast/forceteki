import type Shield from '../../../cards/01_SOR/tokens/Shield';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type Game from '../../Game';
import type Player from '../../Player';
import { TriggerWindowBase } from './TriggerWindowBase';

export class ReplacementEffectWindow extends TriggerWindowBase {
    public constructor(
        game: Game,
        eventWindow: EventWindow
    ) {
        super(game, AbilityType.ReplacementEffect, eventWindow);
    }

    protected override cleanUpTriggers(): void {
        super.cleanUpTriggers();

        this.consolidateShieldTriggers();
    }

    // TODO: currently there is a bug with shields owned by the same player on different units. the player will be
    // prompted to order resolution even though it doesn't matter (or they may not even technically control the effect).
    // see Lom Pyke tests for an example.
    /**
     * If there are multiple Shield triggers present, consolidate down to one per unit to reduce prompt noise.
     * Will randomly choose the Shield to trigger, prioritizing any that have {@link Shield.highPriorityRemoval}` = true`.
     */
    private consolidateShieldTriggers() {
        // pass 1: go through all triggers and select at most 1 shield effect per unit with shield(s)
        const selectedShieldEffectPerUnit = new Map<Card, TriggeredAbilityContext<Shield>>();
        for (const [_player, triggeredAbilities] of this.unresolved) {
            // let selectedShieldEffect: TriggeredAbilityContext<Shield> | null = null;

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
            const selectedShieldEffectsFlat = Array.from(selectedShieldEffectPerUnit.values()).flat();
            const postConsolidateUnresolved = new Map<Player, TriggeredAbilityContext[]>();

            for (const [player, triggeredAbilities] of this.unresolved) {
                const postConsolidateAbilities = triggeredAbilities.filter((ability) =>
                    !ability.source.isShield() ||
                    selectedShieldEffectsFlat.includes(ability as TriggeredAbilityContext<Shield>)
                );

                postConsolidateUnresolved.set(player, postConsolidateAbilities);
            }

            this.unresolved = postConsolidateUnresolved;
        }
    }
}