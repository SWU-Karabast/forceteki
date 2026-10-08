import type { Card } from '../../card/Card';
import type { RelativePlayerFilter, ZoneName } from '../../Constants';
import { RelativePlayer, WildcardRelativePlayer } from '../../Constants';
import { CostAdjustType } from '../../cost/CostAdjuster';
import type { GameSystem } from '../../gameSystem/GameSystem';
import type { Player } from '../../Player';
import { Contract } from '../../utils/Contract';
import { TextHelper } from '../../utils/TextHelper';

/** The out-of-play zones a card can be granted permission to be played from */
export type PlayPermissionZone = ZoneName.Discard;

/** The cost modification a play permission applies to the play it grants */
export type PlayPermissionCostAdjustment =
  | { costAdjustType: CostAdjustType.Free }
  | { costAdjustType: CostAdjustType.Decrease; amount: number }
  | { costAdjustType: CostAdjustType.IgnoreAllAspects };

export interface IPlayPermissionProperties {

    /** The zone the card may be played from */
    zone: PlayPermissionZone;

    /**
     * The player(s) allowed to use the permission. A relative value is resolved against the player
     * resolving the ability that created the permission, at the time it is created.
     */
    player: Player | RelativePlayerFilter;

    /** Cost modification applied only when the card is played using this permission */
    adjustCost?: PlayPermissionCostAdjustment;

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
    readonly adjustCost?: PlayPermissionCostAdjustment;
    readonly enterPlayEffect?: GameSystem | GameSystem[];
}

export function createPlayPermission(
    properties: IPlayPermissionProperties,
    source: Card,
    abilityPlayer?: Player
): IPlayPermission {
    return {
        source,
        zone: properties.zone,
        permittedPlayers: resolvePermittedPlayers(properties.player, abilityPlayer),
        adjustCost: properties.adjustCost,
        enterPlayEffect: properties.enterPlayEffect
    };
}

/** Describes the permission's modifications for the play action title, e.g. "for free (via Cobb Vanth)" */
export function describePlayPermission(permission: IPlayPermission): string {
    const sourceDescription = `(via ${permission.source.title})`;

    switch (permission.adjustCost?.costAdjustType) {
        case undefined:
            return ` ${sourceDescription}`;
        case CostAdjustType.Free:
            return ` for free ${sourceDescription}`;
        case CostAdjustType.Decrease:
            return ` for ${TextHelper.resource(permission.adjustCost.amount)} less ${sourceDescription}`;
        case CostAdjustType.IgnoreAllAspects:
            return `, ignoring its aspect penalties ${sourceDescription}`;
        default:
            Contract.fail(`Unknown cost adjustment for play permission: ${(permission.adjustCost as any).costAdjustType}`);
    }
}

function resolvePermittedPlayers(player: Player | RelativePlayerFilter, abilityPlayer?: Player): Player[] {
    if (typeof player === 'object') {
        return [player];
    }

    Contract.assertNotNullLike(abilityPlayer, `Cannot resolve relative player '${player}' for a play permission without the player resolving the ability`);

    switch (player) {
        case RelativePlayer.Self:
            return [abilityPlayer];
        case RelativePlayer.Opponent:
            return [abilityPlayer.opponent];
        case WildcardRelativePlayer.Any:
            return [abilityPlayer, abilityPlayer.opponent];
        default:
            Contract.fail(`Unknown relative player: ${player}`);
    }
}
