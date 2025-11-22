import { AnimationType, type AnimationEvent } from './AnimationTypes';

// Animation duration constants (in milliseconds)
const DAMAGE_DURATION_MS = 300;
const HEAL_DURATION_MS = 500;
const EXHAUST_DURATION_MS = 300;
const READY_DURATION_MS = 200;
const DEFEAT_DURATION_MS = 600;
const ATTACK_DURATION_MS = 300;
const SHIELD_DEFEAT_DURATION_MS = 600;

/**
 * Helper functions for constructing animation events.
 * Provides static builder methods for common game actions.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AnimationBuilder {
    /**
     * Creates a damage animation event for a single target.
     *
     * @param targetId - Card UUID or base identifier (P1BASE/P2BASE)
     * @param amount - Damage value (positive integer)
     * @param sourceId - Optional attacker/source UUID
     * @param metadata - Optional additional metadata
     * @returns Animation event for damage, or null if amount is invalid
     */
    public static damage(
        targetId: string,
        amount: number,
        sourceId?: string,
        metadata?: Record<string, unknown>
    ): AnimationEvent | null {
        // Skip animation for zero or negative damage
        if (amount <= 0) {
            return null;
        }

        return {
            type: AnimationType.Damage,
            targetId,
            durationMs: DAMAGE_DURATION_MS,
            priority: 90,
            value: amount,
            sourceId,
            metadata,
        };
    }

    /**
     * Creates multiple damage animation events that should execute simultaneously.
     * Useful for distributed damage effects (e.g., Overwhelming Barrage).
     *
     * @param damages - Array of { targetId, amount } objects
     * @param sourceId - Optional source card UUID
     * @returns Array of damage animation events with same groupId
     */
    public static simultaneousDamage(
        damages: { targetId: string; amount: number }[],
        sourceId?: string
    ): AnimationEvent[] {
        const groupId = `damage-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        return damages
            .map(({ targetId, amount }) => {
                const metadata: Record<string, unknown> = {
                    isSimultaneous: true,
                    groupId,
                };
                return this.damage(targetId, amount, sourceId, metadata);
            })
            .filter((event): event is AnimationEvent => event !== null);
    }

    /**
     * Creates a heal animation event.
     *
     * @param targetId - Card UUID or base identifier
     * @param amount - Heal value (positive integer)
     * @param sourceId - Optional source UUID
     * @param metadata - Optional additional metadata
     * @returns Animation event for healing, or null if amount is invalid
     */
    public static heal(
        targetId: string,
        amount: number,
        sourceId?: string,
        metadata?: Record<string, unknown>
    ): AnimationEvent | null {
        // Skip animation for zero or negative heal
        if (amount <= 0) {
            return null;
        }

        return {
            type: AnimationType.Heal,
            targetId,
            durationMs: HEAL_DURATION_MS,
            priority: 90,
            value: amount,
            sourceId,
            metadata,
        };
    }

    /**
     * Creates multiple heal animation events that should execute simultaneously.
     * Useful for distributed healing effects (e.g., Medical Frigate).
     *
     * @param heals - Array of { targetId, amount } objects
     * @param sourceId - Optional source card UUID
     * @returns Array of heal animation events with same groupId
     */
    public static simultaneousHeal(
        heals: { targetId: string; amount: number }[],
        sourceId?: string
    ): AnimationEvent[] {
        const groupId = `heal-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        return heals
            .map(({ targetId, amount }) => {
                const metadata: Record<string, unknown> = {
                    isSimultaneous: true,
                    groupId,
                };
                return this.heal(targetId, amount, sourceId, metadata);
            })
            .filter((event): event is AnimationEvent => event !== null);
    }

    /**
     * Creates an exhaust animation event.
     *
     * @param targetId - Card UUID to exhaust
     * @returns Animation event for exhausting
     */
    public static exhaust(targetId: string): AnimationEvent {
        return {
            type: AnimationType.Exhaust,
            targetId,
            durationMs: EXHAUST_DURATION_MS,
            priority: 80,
        };
    }

    /**
     * Creates a ready animation event.
     *
     * @param targetId - Card UUID to ready
     * @returns Animation event for readying
     */
    public static ready(targetId: string): AnimationEvent {
        return {
            type: AnimationType.Ready,
            targetId,
            durationMs: READY_DURATION_MS,
            priority: 80,
        };
    }

    /**
     * Creates a defeat animation event.
     *
     * @param targetId - Card UUID being defeated
     * @param metadata - Optional metadata including upgrade IDs and card type
     * @param sourceId - Optional source of defeat
     * @returns Animation event for defeat, or null if invalid
     */
    public static defeat(
        targetId: string,
        metadata?: {
            upgradeIds?: string[];
            isUpgrade?: boolean;
            isSimultaneous?: boolean;
            groupId?: string;
        },
        sourceId?: string
    ): AnimationEvent | null {
        if (!targetId) {
            return null;
        }

        const hasUpgrades = metadata?.upgradeIds && metadata.upgradeIds.length > 0;
        const totalDuration = hasUpgrades
            ? 300 + DEFEAT_DURATION_MS // Upgrades fade (300ms) + unit fades (600ms)
            : metadata?.isUpgrade
                ? 300 // Standalone upgrade
                : DEFEAT_DURATION_MS; // Unit without upgrades

        // Build metadata object, only including defined values
        const animationMetadata: Record<string, unknown> = {
            hasUpgrades,
        };

        if (metadata?.upgradeIds) {
            animationMetadata.upgradeIds = metadata.upgradeIds;
        }

        if (metadata?.isUpgrade !== undefined) {
            animationMetadata.isUpgrade = metadata.isUpgrade;
        }

        if (metadata?.isSimultaneous) {
            animationMetadata.isSimultaneous = metadata.isSimultaneous;
        }

        if (metadata?.groupId) {
            animationMetadata.groupId = metadata.groupId;
        }

        return {
            type: AnimationType.Defeat,
            targetId,
            durationMs: totalDuration,
            priority: 80,
            sourceId,
            metadata: animationMetadata,
        };
    }

    /**
     * Creates multiple defeat animation events that should execute simultaneously.
     * Useful for board wipe effects (e.g., Superlaser Blast).
     *
     * @param defeats - Array of defeat data with targetId and optional upgradeIds
     * @param sourceId - Optional source card UUID
     * @returns Array of defeat animation events with same groupId
     */
    public static simultaneousDefeats(
        defeats: { targetId: string; upgradeIds?: string[]; isUpgrade?: boolean }[],
        sourceId?: string
    ): AnimationEvent[] {
        const groupId = `defeat-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        return defeats
            .map(({ targetId, upgradeIds, isUpgrade }) => {
                const metadata = {
                    upgradeIds,
                    isUpgrade,
                    isSimultaneous: true,
                    groupId,
                };
                return this.defeat(targetId, metadata, sourceId);
            })
            .filter((event): event is AnimationEvent => event !== null);
    }

    /**
     * Creates an attack animation event.
     *
     * @param attackerId - Card UUID of attacker
     * @param defenderId - Card UUID or base identifier of defender
     * @param damageDealt - Optional damage amount
     * @returns Animation event for attack
     */
    public static attack(
        attackerId: string,
        defenderId: string,
        damageDealt?: number
    ): AnimationEvent {
        return {
            type: AnimationType.Attack,
            targetId: attackerId,
            durationMs: ATTACK_DURATION_MS,
            priority: 100,
            sourceId: attackerId,
            metadata: {
                defenderId,
                damageDealt,
            },
        };
    }

    /**
     * Creates a shield break/defeat animation event.
     *
     * @param targetId - Card UUID losing shield
     * @param metadata - Optional metadata for simultaneous animations and shield identification
     * @returns Animation event for shield break
     */
    public static loseShield(
        targetId: string,
        metadata?: {
            isSimultaneous?: boolean;
            groupId?: string;
            shieldUuid?: string;
            shieldIndex?: number;
            totalShields?: number;
        }
    ): AnimationEvent {
        return {
            type: AnimationType.LoseShield,
            targetId,
            durationMs: SHIELD_DEFEAT_DURATION_MS,
            priority: 90,
            metadata,
        };
    }

    /**
     * Creates multiple shield break animation events that should execute simultaneously.
     *
     * @param targetIds - Array of card UUIDs losing shields
     * @returns Array of shield break animation events with same groupId
     */
    public static simultaneousShieldLosses(targetIds: string[]): AnimationEvent[] {
        const groupId = `shield-lose-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        return targetIds.map((targetId) =>
            this.loseShield(targetId, {
                isSimultaneous: true,
                groupId,
            })
        );
    }
}
