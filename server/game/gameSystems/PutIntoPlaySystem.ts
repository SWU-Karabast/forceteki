import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardType, EventName, Location, RelativePlayer } from '../core/Constants';
import { isArena } from '../core/utils/EnumHelpers';
import type Player from '../core/Player';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Card from '../core/card/Card';

export interface IPutIntoPlayProperties extends ICardTargetSystemProperties {
    controller?: RelativePlayer;
    side?: RelativePlayer;
    overrideLocation?: Location;
}

export class PutIntoPlaySystem extends CardTargetSystem {
    name = 'putIntoPlay';
    eventName = EventName.OnUnitEntersPlay;
    cost = 'putting {0} into play';
    targetType = [CardType.Unit];
    defaultProperties: IPutIntoPlayProperties = {
        controller: RelativePlayer.Self,
        side: null,
        overrideLocation: null
    };

    constructor(
        properties: ((context: AbilityContext) => IPutIntoPlayProperties) | IPutIntoPlayProperties
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
        let { target } = this.generatePropertiesFromContext(context);
        return ['put {0} into play', [target]];
    }

    canAffect(card: Card, context: AbilityContext): boolean {
        let properties = this.generatePropertiesFromContext(context) as IPutIntoPlayProperties;
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

    addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        let { controller, side, overrideLocation } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IPutIntoPlayProperties;
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
        if (event.controller === RelativePlayer.Opponent) {
            finalController = finalController.opponent;
        }

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
