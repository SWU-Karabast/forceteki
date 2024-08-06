import { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import Player from '../player';
import { PlayerAction, PlayerActionProperties } from './PlayerAction';

export interface DiscardFavorProperties extends PlayerActionProperties {}

export class DiscardFavorAction extends PlayerAction<DiscardFavorProperties> {
    name = 'discardFavor';
    eventName = EventNames.OnDiscardFavor;
    cost = 'discarding the Imperial Favor';
    effect = 'make {0} lose the Imperial Favor';

    canAffect(player: Player, context: AbilityContext): boolean {
        return player.imperialFavor && super.canAffect(player, context);
    }

    eventHandler(event): void {
        event.player.loseImperialFavor();
    }
}