import type { AbilityContext } from '../core/ability/AbilityContext';
import { AbilityRestriction, CardType, EventName, Location } from '../core/Constants';
import { isAttackableLocation, isArena } from '../core/utils/EnumHelpers';
import { Attack } from '../core/attack/Attack';
import { EffectName } from '../core/Constants';
import { AttackFlow } from '../core/attack/AttackFlow';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { damage } from './GameSystemLibrary.js';
import type Card from '../core/card/Card';
import { isArray } from 'underscore';
import { GameEvent } from '../core/event/GameEvent';
import { ILastingEffectCardProperties, LastingEffectCardSystem } from '../core/gameSystem/LastingEffectCardSystem';

export type IAttackLastingEffectCardProperties = Omit<ILastingEffectCardProperties, 'duration'>;

export interface IAttackProperties extends ICardTargetSystemProperties {
    attacker?: Card;
    attackerCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
    message?: string;
    messageArgs?: (attack: Attack, context: AbilityContext) => any | any[];
    costHandler?: (context: AbilityContext, prompt: any) => void;

    /**
     * Effects to trigger for the duration of the attack. Can be one or more {@link ILastingEffectCardProperties}
     * or a function generator(s) for them.
     */
    effects?: IAttackLastingEffectCardProperties | ((context: AbilityContext, attack: Attack) => IAttackLastingEffectCardProperties) |
        (IAttackLastingEffectCardProperties | ((context: AbilityContext, attack: Attack) => IAttackLastingEffectCardProperties))[]
}

export class AttackSystem extends CardTargetSystem<IAttackProperties> {
    public override readonly name = 'attack';
    public override readonly eventName = EventName.Unnamed;
    protected override readonly defaultProperties: IAttackProperties = {};
    protected override readonly targetType = [CardType.Unit, CardType.Base];

    public eventHandler(event, additionalProperties): void {
        const context = event.context;
        const target = event.target;

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (
            !isArena(properties.attacker.location) || !isAttackableLocation(target.location)
        ) {
            context.game.addMessage(
                'The attack cannot proceed as the attacker or defender is no longer in play'
            );
            return;
        }

        this.registerAttackEffects(context, properties, event.attack);

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

    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): IAttackProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IAttackProperties;
        if (!properties.attacker) {
            properties.attacker = context.source;
        }
        return properties;
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            '{0} initiates attack against {1}',
            [properties.attacker, properties.target]
        ];
    }

    public override canAffect(targetCard: Card, context: AbilityContext, additionalProperties = {}): boolean {
        if (!context.player.opponent) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (!super.canAffect(targetCard, context)) {
            return false;
        }
        if (targetCard === properties.attacker || targetCard.controller === properties.attacker.controller) {
            return false; //cannot attack yourself or your controller's cards
        }
        if (targetCard.hasRestriction(AbilityRestriction.BeAttacked, context)) {
            return false;
        }
        // TODO SENTINEL: check will go here
        if (
            targetCard.location !== properties.attacker.location &&
            targetCard.location !== Location.Base &&
            !(targetCard.location === Location.SpaceArena && context.source.anyEffect(EffectName.CanAttackGroundArenaFromSpaceArena)) &&
            !(targetCard.location === Location.GroundArena && context.source.anyEffect(EffectName.CanAttackSpaceArenaFromGroundArena))
        ) {
            return false;
        }

        return (
            properties.attacker &&
            isAttackableLocation(targetCard.location)
        );
    }

    public attackCosts(prompt, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    public override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const { target } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        );

        const cards = (target as Card[]).filter((card) => this.canAffect(card, context));
        if (cards.length !== 1) {
            return [];
        }

        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);

        return [event];
    }

    public override addPropertiesToEvent(event, target, context: AbilityContext, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (isArray(target)) {
            if (target.length !== 1) {
                context.game.addMessage(`Attack requires exactly one target, cannot attack ${target.length} targets`);
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

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.target, event.context, additionalProperties);
    }

    private resolveAttack(attack: Attack, context: AbilityContext): void {
        if (!attack.isValid()) {
            context.game.addMessage('The attack cannot proceed as the attacker or defender is no longer in play');
            return;
        }

        // event for damage dealt to target by attacker
        const damageEvents = [damage({ amount: attack.attackerTotalPower, isCombatDamage: true }).generateEvent(attack.target, context)];

        // event for damage dealt to attacker by defender, if any
        if (!attack.targetIsBase) {
            damageEvents.push(damage({ amount: attack.defenderTotalPower, isCombatDamage: true }).generateEvent(attack.attacker, context));
        }

        context.game.openEventWindow(damageEvents);
    }

    // TODO ATTACKS: change attack effects so that they check the specific attack they are affecting,
    // in case we have have a situation when multiple attacks are happening in parallel but an effect
    // only applies to one of them.
    private registerAttackEffects(context: AbilityContext, properties: IAttackProperties, attack: Attack) {
        if (!properties.effects) {
            return;
        }

        let effects = properties.effects;
        if (!isArray(effects)) {
            effects = [effects];
        }

        // create events for all effects to be generated
        const effectEvents: GameEvent[] = [];
        for (const effect of effects) {
            const effectProperties = typeof effect === 'function' ? effect(context, attack) : effect;

            const effectSystem = new LastingEffectCardSystem(effectProperties);
            effectEvents.push(...effectSystem.generateEventsForAllTargets(context));
        }

        // trigger events
        context.game.openEventWindow(effectEvents);

        // TODO EFFECTS: remove this hack
        context.game.queueSimpleStep(() => context.game.resolveGameState(), 'resolveGameState for AttackSystem');
    }
}
