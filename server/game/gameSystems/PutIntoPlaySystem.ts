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
    override name = 'putIntoPlay';
    override eventName = EventName.OnUnitEntersPlay;
    override costDescription = 'putting {0} into play';
    override targetType = [CardType.Unit];
    override defaultProperties: IPutIntoPlayProperties = {
        controller: RelativePlayer.Self,
        side: null,
        overrideLocation: null
    };

    public constructor(
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

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context);
        return ['put {0} into play', [target]];
    }

    override canAffect(card: Card, context: AbilityContext): boolean {
        const properties = this.generatePropertiesFromContext(context) as IPutIntoPlayProperties;
        const contextCopy = context.copy({ source: card });
        const player = this.getPutIntoPlayPlayer(contextCopy);
        const targetSide = properties.side || this.getDefaultSide(contextCopy);

        if (!context || !super.canAffect(card, context)) {
            return false;
        // TODO: smuggle impl here
        } else if (isArena(card.location) || card.facedown) {
            return false;
        // TODO: enums for restrictions instead of raw strings
        } else if (!card.checkRestrictions('putIntoPlay', context)) {
            return false;
        } else if (!player.checkRestrictions('enterPlay', contextCopy)) {
            return false;
        }
        return true;
    }

    override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { controller, side, overrideLocation } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IPutIntoPlayProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.controller = controller;
        event.originalLocation = overrideLocation || card.location;
        event.side = side || this.getDefaultSide(context);
    }

    eventHandler(event, additionalProperties = {}): void {
        const player = this.getPutIntoPlayPlayer(event.context);
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
