import type { AbilityContext } from '../../ability/AbilityContext';
import type { Card } from '../../card/Card';
import type { RelativePlayerFilter, ZoneName } from '../../Constants';
import { RelativePlayer, WildcardRelativePlayer } from '../../Constants';
import type { ICostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties } from '../../cost/CostAdjuster';
import { CostAdjustType } from '../../cost/CostAdjuster';
import type { GameSystem } from '../../gameSystem/GameSystem';
import type { Player } from '../../Player';
import { Contract } from '../../utils/Contract';
import { Helpers } from '../../utils/Helpers';
import { TextHelper } from '../../utils/TextHelper';

/**
 * The out-of-play zones a card can be granted permission to be played from.
 *
 * Currently, only the discard zone is supported. Adding a zone here is not enough on its own: the action window
 * only offers actions for cards in the zones listed in `ActionWindow.getSelectableCards`, so the new zone must be
 * added there too (and be clickable in the client).
 */
export type PlayPermissionZone = ZoneName.Discard;

export interface IPlayPermissionProperties {

    /** The zone the card may be played from */
    zone: PlayPermissionZone;

    /**
     * Who may use the permission: either a specific `Player`, or a relative value that is resolved once,
     * when the permission is created, relative to the player resolving the ability that creates it.
     * For example, Stolen AT-Hauler uses `RelativePlayer.Opponent`: when it's defeated, the permission goes
     * to the opponent of the player resolving its When Defeated ability.
     */
    player: Player | RelativePlayerFilter;

    /** Cost modification applied only when the card is played using this permission */
    adjustCost?: ICostAdjusterProperties;

    /** Effect(s) resolved as the unit enters play, only when played using this permission */
    enterPlayEffect?: GameSystem | GameSystem[];
}

/**
 * A lasting permission to play a specific card from an out-of-play zone. Each permission is its own
 * modified "play a card" action: its cost modification and enter-play effect apply only when the
 * card is played using that permission, and don't combine with other permissions or with abilities
 * that play the card directly.
 */
export interface IPlayPermission {

    /** The card credited for the permission (for a gained ability, the card that granted it) */
    readonly source: Card;
    readonly zone: PlayPermissionZone;
    readonly permittedPlayers: readonly Player[];
    readonly adjustCost?: ICostAdjusterProperties;
    readonly enterPlayEffect?: GameSystem | GameSystem[];
}

export namespace PlayPermissionHelpers {
    export function create(
        properties: IPlayPermissionProperties,
        source: Card,
        createdByPlayer?: Player
    ): IPlayPermission {
        return {
            source,
            zone: properties.zone,
            permittedPlayers: resolvePermittedPlayers(properties.player, createdByPlayer),
            adjustCost: properties.adjustCost,
            enterPlayEffect: properties.enterPlayEffect
        };
    }

    /**
     * Whether two permissions grant the same play, so that only one of their actions needs to be offered
     * (e.g. two Boga triggers on the same card). The cost adjustment's properties are compared by value and
     * enter-play effects by reference, so permissions are only treated as the same when they're known to match.
     */
    export function isEquivalent(first: IPlayPermission, second: IPlayPermission): boolean {
        return first.source.internalName === second.source.internalName &&
          first.zone === second.zone &&
          haveSameElements(first.permittedPlayers, second.permittedPlayers) &&
          haveSameCostAdjustment(first.adjustCost, second.adjustCost) &&
          haveSameElements(Helpers.asArray(first.enterPlayEffect), Helpers.asArray(second.enterPlayEffect));
    }

    /**
     * Describes the permission's modifications for the play action title, e.g. "for free (via Cobb Vanth)".
     * A cost amount computed from game state is only included when the context of the play is provided.
     */
    export function describe(permission: IPlayPermission, context?: AbilityContext): string {
        return `${describeCostAdjustment(permission.adjustCost, context)} (via ${permission.source.title})`;
    }

    function describeCostAdjustment(adjustCost: ICostAdjusterProperties | undefined, context?: AbilityContext): string {
        switch (adjustCost?.costAdjustType) {
            case CostAdjustType.Free:
                return ' for free';
            case CostAdjustType.Decrease:
            case CostAdjustType.Increase: {
                const amount = resolveAmount(adjustCost, context);
                if (amount == null) {
                    return '';
                }
                return ` for ${TextHelper.resource(amount)} ${adjustCost.costAdjustType === CostAdjustType.Decrease ? 'less' : 'more'}`;
            }
            case CostAdjustType.IgnoreAllAspects:
                return ', ignoring its aspect penalties';
            case CostAdjustType.IgnoreSpecificAspects:
                return `, ignoring its ${TextHelper.aspect(adjustCost.ignoredAspect)} aspect penalty`;
            default:
                return '';
        }
    }

    function resolveAmount(adjustCost: IIncreaseOrDecreaseCostAdjusterProperties, context?: AbilityContext): number | null {
        if (typeof adjustCost.amount === 'function') {
            return context ? adjustCost.amount(context.source, context.player, context) : null;
        }

        return adjustCost.amount ?? null;
    }

    function haveSameCostAdjustment(first: ICostAdjusterProperties | undefined, second: ICostAdjusterProperties | undefined): boolean {
        if (first == null || second == null) {
            return first === second;
        }

        const firstEntries = Object.entries(first);
        const secondValues = new Map<string, unknown>(Object.entries(second));
        return firstEntries.length === secondValues.size &&
          firstEntries.every(([key, value]) => secondValues.has(key) && secondValues.get(key) === value);
    }

    function haveSameElements<T>(first: readonly T[], second: readonly T[]): boolean {
        return first.length === second.length && first.every((element) => second.includes(element));
    }

    function resolvePermittedPlayers(player: Player | RelativePlayerFilter, createdByPlayer?: Player): Player[] {
        if (typeof player === 'object') {
            return [player];
        }

        Contract.assertNotNullLike(createdByPlayer, `Cannot resolve relative player '${player}' for a play permission without the player resolving the ability`);

        switch (player) {
            case RelativePlayer.Self:
                return [createdByPlayer];
            case RelativePlayer.Opponent:
                return [createdByPlayer.opponent];
            case WildcardRelativePlayer.Any:
                return [createdByPlayer, createdByPlayer.opponent];
            default:
                Contract.fail(`Unknown relative player: ${player}`);
        }
    }
}
