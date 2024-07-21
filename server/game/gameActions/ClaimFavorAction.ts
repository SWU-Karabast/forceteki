import type { AbilityContext } from '../AbilityContext';
import { EventNames, FavorTypes } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface ClaimFavorProperties extends PlayerActionProperties {
    target: Player | null;
    side?: FavorTypes;
}

export class ClaimFavorAction extends PlayerAction<ClaimFavorProperties> {
    name = 'claimFavor';
    eventName = EventNames.OnClaimFavor;
    effect = "claim the Emperor's favor";

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.getProperties(context, additionalProperties);
        if (Array.isArray(properties.target)) {
            return !!properties.target[0];
        }
        return !!properties.target;
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        return !!player && super.canAffect(player, context);
    }

    eventHandler(event, additionalProperties = {}): void {
        let { side } = this.getProperties(event.context, additionalProperties);
        if (event.player) {
            event.player.claimImperialFavor(side);
        }
    }
}