import type { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames, Locations, Players, isArena } from '../Constants';
import type Player from '../player';
import { type CardActionProperties, CardGameAction } from './CardGameAction';
import BaseCard from '../card/basecard';

export interface PutIntoPlayProperties extends CardActionProperties {
    controller?: Players;
    side?: Player;
    overrideLocation?: Locations;
}

export class PutIntoPlayAction extends CardGameAction {
    name = 'putIntoPlay';
    eventName = EventNames.OnUnitEntersPlay;
    cost = 'putting {0} into play';
    targetType = [CardTypes.Unit];
    defaultProperties: PutIntoPlayProperties = {
        controller: Players.Self,
        side: null,
        overrideLocation: null
    };

    constructor(
        properties: ((context: AbilityContext) => PutIntoPlayProperties) | PutIntoPlayProperties
    ) {
        super(properties);
    }

    getDefaultSide(context: AbilityContext) {
        return context.player;
    }

    getPutIntoPlayPlayer(context: AbilityContext) {
        return context.player;
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let { target } = this.getProperties(context);
        return ['put {0} into play', [target]];
    }

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        let properties = this.getProperties(context) as PutIntoPlayProperties;
        let contextCopy = context.copy({ source: card });
        let player = this.getPutIntoPlayPlayer(contextCopy);
        let targetSide = properties.side || this.getDefaultSide(contextCopy);

        if (!context || !super.canAffect(card, context)) {
            return false;
        // TODO: smuggle impl here
        } else if (isArena(card.location) || card.isFacedown()) {
            return false;
        // TODO: enums for restrictions instead of raw strings
        } else if (!card.checkRestrictions('putIntoPlay', context)) {
            return false;
        } else if (!player.checkRestrictions('enterPlay', contextCopy)) {
            return false;
        }
        return true;
    }

    addPropertiesToEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        let { controller, side, overrideLocation } = this.getProperties(
            context,
            additionalProperties
        ) as PutIntoPlayProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.controller = controller;
        event.originalLocation = overrideLocation || card.location;
        event.side = side || this.getDefaultSide(context);
    }

    eventHandler(event, additionalProperties = {}): void {
        let player = this.getPutIntoPlayPlayer(event.context);
        event.card.new = true;
        if (event.fate) {
            event.card.fate = event.fate;
        }

        let finalController = event.context.player;
        if (event.controller === Players.Opponent) {
            finalController = finalController.opponent;
        }

        let targetSide = event.side;

        player.moveCard(event.card, event.card.defaultArena);

        if (event.status === 'ready') {
            event.card.ready();
        } else {
            event.card.exhaust();
        }

        //moveCard sets all this stuff and only works if the owner is moving cards, so we're switching it around
        if (event.card.controller !== finalController) {
            event.card.controller = finalController;
            event.card.setDefaultController(event.card.controller);
            event.card.owner.cardsInPlay.splice(event.card.owner.cardsInPlay.indexOf(event.card), 1);
            event.card.controller.cardsInPlay.push(event.card);
        }
    }
}
