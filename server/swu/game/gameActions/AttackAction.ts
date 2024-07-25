import type { AbilityContext } from '../AbilityContext';
import { CardTypes, Durations, EventNames, Locations, isArena } from '../Constants';
import type DeckCard from '../card/deckcard';
import { Attack } from '../attack/Attack';
import { EffectNames } from '../Constants'
import { AttackFlow } from '../attack/AttackFlow';
import type { TriggeredAbilityContext } from '../TriggeredAbilityContext';
import { CardGameAction, type CardActionProperties } from './CardGameAction';
import { type GameAction } from './GameAction';

export interface AttackProperties extends CardActionProperties {
    attacker?: DeckCard;
    attackerCondition?: (card: DeckCard, context: TriggeredAbilityContext) => boolean;
    message?: string;
    messageArgs?: (attack: Attack, context: AbilityContext) => any | any[];
    costHandler?: (context: AbilityContext, prompt: any) => void;
    statistic?: (card: DeckCard) => number;
}

export class AttackAction extends CardGameAction {
    name = 'attack';
    eventName = EventNames.OnAttackDeclared;
    targetType = [CardTypes.Unit, CardTypes.Base];  // TODO: leader?

    defaultProperties: AttackProperties = {};

    // TODO: maybe rename to "appendProperties" for clarity
    getProperties(context: AbilityContext, additionalProperties = {}): AttackProperties {
        const properties = super.getProperties(context, additionalProperties) as AttackProperties;
        if (!properties.attacker) {
            properties.attacker = context.source;
        }
        return properties;
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.getProperties(context);
        return [
            '{0} initiates attack against {1}',
            [properties.attacker, properties.target]
        ];
    }

    canAffect(card: DeckCard, context: AbilityContext, additionalProperties = {}): boolean {
        if (!context.player.opponent) {
            return false;
        }

        const properties = this.getProperties(context, additionalProperties);
        if (!super.canAffect(card, context)) {
            return false;
        }
        if (card === properties.attacker || card.controller === properties.attacker.controller) {
            return false; //cannot attack yourself or your controller's cards
        }
        if (!card.checkRestrictions('beAttacked', context)) {
            return false;
        } 
        if (
            card.location !== properties.attacker.location &&
            !(card.location === Locations.SpaceArena && context.source.anyEffects(EffectNames.CanAttackGroundArenaFromSpaceArena)) &&
            !(card.location === Locations.GroundArena && context.source.anyEffects(EffectNames.CanAttackSpaceArenaFromGroundArena))
        ) {
            return false;
        }

        return (
            properties.attacker &&
            isArena(card.location)
        );
    }

    // TODO: change this to resolve the damage (we don't have a similar concept to a "duel effect" gameAction)
    resolveAttack(duel: Attack, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.getProperties(context, additionalProperties);

        

        const gameAction =
            typeof properties.gameAction === 'function' ? properties.gameAction(duel, context) : properties.gameAction;
        if (gameAction && gameAction.hasLegalTarget(context)) {
            const [message, messageArgs] = properties.message
                ? [properties.message, properties.messageArgs ? [].concat(properties.messageArgs(duel, context)) : []]
                : gameAction.getEffectMessage(context);
            context.game.addMessage('Duel Effect: ' + message, ...messageArgs);
            gameAction.resolve(null, context);
        } else {
            context.game.addMessage('The duel has no effect');
        }
    }

    attackCosts(prompt, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.getProperties(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    // TODO: change form from this to "generateEvents" for clarity
    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const { target } = this.getProperties(
            context,
            additionalProperties
        );

        const cards = (target as DeckCard[]).filter((card) => this.canAffect(card, context));
        if (cards.length !== 1) {
            return;
        }

        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);

        events.push(event);
    }

    addPropertiesToEvent(event, cards, context: AbilityContext, additionalProperties): void {
        const properties = this.getProperties(context, additionalProperties);
        if (!cards) {
            cards = this.getProperties(context, additionalProperties).target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        event.cards = cards;
        event.context = context;
        event.attacker = properties.attacker;
        event.target = properties.target;

        const duel = new Attack(
            context.game,
            properties.attacker,
            cards,
            properties,
            properties.statistic,
            context.player
        );
        event.duel = duel;
    }

    eventHandler(event, additionalProperties): void {
        const context = event.context;
        const cards = event.cards;

        if (cards.length > 1) {
            context.game.addMessage(
                'The attack cannot proceed with multiple targets'
            );
            return;
        }
        let target = cards[0];

        const properties = this.getProperties(context, additionalProperties);
        if (
            !isArena(properties.attacker.location) || !isArena(target.location)
        ) {
            context.game.addMessage(
                'The attack cannot proceed as the attacker or defender is no longer in play'
            );
            return;
        }
        
        const attack = event.attack;
        context.game.queueStep(
            new AttackFlow(
                context.game,
                attack,
                (attack) => this.resolveAttack(attack, event.context, additionalProperties),
                properties.costHandler
                    ? (prompt) => this.attackCosts(prompt, event.context, additionalProperties)
                    : undefined
            )
        );
    }

    checkEventCondition(event, additionalProperties) {
        return event.cards.some((card) => this.canAffect(card, event.context, additionalProperties));
    }
}