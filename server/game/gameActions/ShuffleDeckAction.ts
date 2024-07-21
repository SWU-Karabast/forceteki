import type { AbilityContext } from '../AbilityContext';
import { Locations } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface ShuffleDeckProperties extends PlayerActionProperties {
    deck: Locations;
}

export class ShuffleDeckAction extends PlayerAction {
    defaultProperties: ShuffleDeckProperties;

    name = 'refill';
    effect = 'refill its province faceup';
    constructor(propertyFactory: ShuffleDeckProperties | ((context: AbilityContext) => ShuffleDeckProperties)) {
        super(propertyFactory);
    }

    defaultTargets(context: AbilityContext): Player[] {
        return [context.player];
    }

    eventHandler(event, additionalProperties): void {
        let { deck } = this.getProperties(event.context, additionalProperties) as ShuffleDeckProperties;
        if (deck === Locations.ConflictDeck) {
            event.player.shuffleConflictDeck();
        } else if (deck === Locations.DynastyDeck) {
            event.player.shuffleDynastyDeck();
        }
    }
}