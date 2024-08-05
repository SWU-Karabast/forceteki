import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardTypes, EventNames, Locations, isArena, isAttackableLocation as isAttackableLocation } from '../core/Constants';
import { Attack } from '../core/attack/Attack';
import { EffectNames } from '../core/Constants'
import { AttackFlow } from '../core/attack/AttackFlow';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { damage } from './GameSystemLibrary.js';
import type Card from '../core/card/Card';       // TODO: is this the right import form?
import { isArray } from 'underscore';


export interface IAttackProperties extends ICardTargetSystemProperties {
    attacker?: Card;
    attackerCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
    message?: string;
    messageArgs?: (attack: Attack, context: AbilityContext) => any | any[];
    costHandler?: (context: AbilityContext, prompt: any) => void;
    statistic?: (card: Card) => number;
}

export class AttackSystem extends CardTargetSystem<IAttackProperties> {
    name = 'attack';
    eventName = EventNames.OnAttackDeclared;
    targetType = [CardTypes.Unit, CardTypes.Base];  // TODO: leader?

    defaultProperties: IAttackProperties = {};

    // TODO: maybe rename to "appendProperties" for clarity
    getProperties(context: AbilityContext, additionalProperties = {}): IAttackProperties {
        const properties = super.getProperties(context, additionalProperties) as IAttackProperties;
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

    canAffect(targetCard: Card, context: AbilityContext, additionalProperties = {}): boolean {
        if (!context.player.opponent) {
            return false;
        }

        const properties = this.getProperties(context, additionalProperties);
        if (!super.canAffect(targetCard, context)) {
            return false;
        }
        if (targetCard === properties.attacker || targetCard.controller === properties.attacker.controller) {
            return false; //cannot attack yourself or your controller's cards
        }
        if (!targetCard.checkRestrictions('beAttacked', context)) {
            return false;
        }
        // TODO: sentinel check will go here
        if (
            targetCard.location !== properties.attacker.location &&
            targetCard.location !== Locations.Base &&
            !(targetCard.location === Locations.SpaceArena && context.source.anyEffect(EffectNames.CanAttackGroundArenaFromSpaceArena)) &&
            !(targetCard.location === Locations.GroundArena && context.source.anyEffect(EffectNames.CanAttackSpaceArenaFromGroundArena))
        ) {
            return false;
        }

        return (
            properties.attacker &&
            isAttackableLocation(targetCard.location)
        );
    }

    resolveAttack(attack: Attack, context: AbilityContext): void {
        // event for damage dealt to target by attacker
        let damageEvents = [damage({ amount: attack.attackerTotalPower, isCombatDamage: true }).getEvent(attack.target, context)];

        // event for damage dealt to attacker by defender, if any
        if (!attack.targetIsBase) {
            damageEvents.push(damage({ amount: attack.defenderTotalPower, isCombatDamage: true }).getEvent(attack.attacker, context));
        }

        context.game.openEventWindow(damageEvents);
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

        const cards = (target as Card[]).filter((card) => this.canAffect(card, context));
        if (cards.length !== 1) {
            return;
        }

        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);

        events.push(event);
    }

    addPropertiesToEvent(event, target, context: AbilityContext, additionalProperties): void {
        const properties = this.getProperties(context, additionalProperties);

        if (isArray(target)) {
            if (target.length !== 1) {
                context.game.addMessage(`Attack requires exactly one target, cannot attack ${properties.target.length} targets`);
                return;
            }

            event.target = target[0];
        } else {
            event.target = target;
        }

        event.context = context;
        event.attacker = properties.attacker;

        event.attack = new Attack(
            context.game,
            properties.attacker,
            event.target
        );
    }

    eventHandler(event, additionalProperties): void {
        const context = event.context;
        const target = event.target;

        const properties = this.getProperties(context, additionalProperties);
        if (
            !isArena(properties.attacker.location) || !isAttackableLocation(target.location)
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
                (attack) => this.resolveAttack(attack, event.context),
                // properties.costHandler
                //     ? (prompt) => this.attackCosts(prompt, event.context, additionalProperties)
                //     : undefined
            )
        );
    }

    checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.target, event.context, additionalProperties);
    }
}