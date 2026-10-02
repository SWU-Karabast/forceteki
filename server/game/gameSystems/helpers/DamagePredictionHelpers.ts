import type { AbilityContext } from '../../core/ability/AbilityContext';
import type DamageModificationAbility from '../../core/ability/DamageModificationAbility';
import type { IUnitCard } from '../../core/card/propertyMixins/UnitProperties';
import { EffectName } from '../../core/Constants';
import type { Game } from '../../core/Game';
import type { DamageSystem, IHypotheticalDamageEvent } from '../DamageSystem';

export interface IDamageOutcomePrediction {

    /** The least damage the unit can end up taking, assuming every choice along the way is made in its favor */
    minimumDamage: number;

    /** True if the unit would be defeated by the damage even if every choice is made in its favor */
    wouldBeDefeated: boolean;
}

/**
 * Predicts the outcome of `damageSystem` dealing damage to `unit`, accounting for any damage modification effects
 * (Shield tokens, Deadly Vulnerability, Numa, etc.) that would apply to the damage event.
 *
 * Modifications that are mandatory are always applied. For anything that depends on a player choice (optional modifications
 * such as Queen Amidala's, or the order of several modifications), the prediction assumes the choice is made in the unit's
 * favor. This is optimistic by design: if the actual outcome turns out worse (e.g. a player declines to prevent the damage),
 * the player can still recover from an unpayable cost by rolling back (see `CostPaymentRecovery`), whereas a pessimistic
 * prediction would block plays that are legal.
 *
 * Side effects of modifications on other cards (e.g. Queen Amidala defeating another friendly unit) are not predicted.
 */
export function predictDamageOutcome<TContext extends AbilityContext>(
    damageSystem: DamageSystem<TContext>,
    unit: IUnitCard,
    context: TContext
): IDamageOutcomePrediction {
    if (!unit.canBeDamaged()) {
        return { minimumDamage: 0, wouldBeDefeated: false };
    }

    const damageEvent = damageSystem.buildHypotheticalDamageEvent(unit, context);
    const minimumDamage = getMinimumDamage(damageEvent, getActiveDamageModificationAbilities(context.game), new Set());

    return {
        minimumDamage,
        wouldBeDefeated: minimumDamage > 0 &&
          minimumDamage >= unit.remainingHp &&
          !unit.hasOngoingEffect(EffectName.CannotBeDefeatedByDamage)
    };
}

function getActiveDamageModificationAbilities(game: Game): DamageModificationAbility[] {
    const abilities: DamageModificationAbility[] = [];

    for (const card of game.allCards) {
        if (!card.canRegisterTriggeredAbilities()) {
            continue;
        }

        for (const ability of card.getTriggeredAbilities()) {
            if (ability.isDamageModificationAbility() && ability.isListeningForEvents) {
                abilities.push(ability);
            }
        }
    }

    return abilities;
}

/**
 * Recursively explores the ways the damage event could be modified and returns the lowest resulting damage.
 * As with real replacement effects, an ability can't modify the same damage more than once.
 */
function getMinimumDamage(damageEvent: IHypotheticalDamageEvent, abilities: DamageModificationAbility[], appliedAbilities: Set<DamageModificationAbility>): number {
    if (damageEvent.amount <= 0) {
        return 0;
    }

    let mustApplyModification = false;
    let minimumDamage = Infinity;

    for (const ability of abilities) {
        if (appliedAbilities.has(ability)) {
            continue;
        }

        const modification = ability.predictModification(damageEvent);
        if (modification == null) {
            continue;
        }

        mustApplyModification = mustApplyModification || !modification.optional;

        const damageAfterModification = getMinimumDamage(
            { ...damageEvent, amount: modification.modifiedAmount },
            abilities,
            new Set([...appliedAbilities, ability])
        );

        minimumDamage = Math.min(minimumDamage, damageAfterModification);
    }

    // optional modifications can all be declined, but if any mandatory one applies then some modification must happen
    return mustApplyModification ? minimumDamage : Math.min(minimumDamage, damageEvent.amount);
}
