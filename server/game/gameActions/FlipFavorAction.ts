import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface FlipFavorProperties extends PlayerActionProperties {
    target: Player | null;
}

export class FlipFavorAction extends PlayerAction<FlipFavorProperties> {
    name = 'claimFavor';
    eventName = EventNames.OnFlipFavor;
    effect = 'flip the Imperial favor';

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        return this.playerHasFlippableFavor(context.player) || this.playerHasFlippableFavor(context.player.opponent);
    }

    playerHasFlippableFavor(player: Player) {
        return player && !!player.imperialFavor && player.imperialFavor !== 'both';
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        return !!player && this.playerHasFlippableFavor(player) && super.canAffect(player, context);
    }

    eventHandler(event): void {
        if (event.player.imperialFavor === 'military') event.player.imperialFavor = 'political';
        else if (event.player.imperialFavor === 'political') event.player.imperialFavor = 'military';
    }
}