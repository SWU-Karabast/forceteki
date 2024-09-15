import type { AbilityContext } from '../core/ability/AbilityContext';
import { AbilityRestriction, CardType, CardTypeFilter, Duration, EventName, KeywordName, Location, WildcardCardType, WildcardLocation } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { Attack } from '../core/attack/Attack';
import { EffectName } from '../core/Constants';
import { AttackFlow } from '../core/attack/AttackFlow';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { damage } from './GameSystemLibrary.js';
import type { Card } from '../core/card/Card';
import { isArray } from 'underscore';
import { GameEvent } from '../core/event/GameEvent';
import { ICardLastingEffectProperties, CardLastingEffectSystem } from './CardLastingEffectSystem';
import Contract from '../core/utils/Contract';
import { CardWithDamageProperty, UnitCard } from '../core/card/CardTypes';
import * as Helpers from '../core/utils/Helpers';

export type IAttackLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration' | 'target' | 'condition' > & {
    condition?: (attack: Attack, context: AbilityContext) => boolean;
}

type IAttackLastingEffectPropertiesOrFactory = IAttackLastingEffectProperties | ((context: AbilityContext, attack: Attack) => IAttackLastingEffectProperties);

export interface IAttackProperties extends ICardTargetSystemProperties {
    attacker?: Card;
    targetCondition?: (card: Card, context: AbilityContext) => boolean;
    message?: string;
    messageArgs?: (attack: Attack, context: AbilityContext) => any | any[];
    costHandler?: (context: AbilityContext, prompt: any) => void;

    /**
     * Effects to apply to the attacker for the duration of the attack. Can be one or more {@link IAttackLastingEffectProperties}
     * or a function generator(s) for them.
     */
    attackerLastingEffects?: IAttackLastingEffectPropertiesOrFactory | IAttackLastingEffectPropertiesOrFactory[];

    /**
     * Effects to apply to the attacker for the duration of the attack. Can be one or more {@link IAttackLastingEffectProperties}
     * or a function generator(s) for them.
     */
    defenderLastingEffects?: IAttackLastingEffectPropertiesOrFactory | IAttackLastingEffectPropertiesOrFactory[];
}

/**
 * Manages the concrete steps of the attack process, emitting events at the appropriate stages.
 * Does not manage the exhaust cost. The attacker must already be selected and set via the `attacker` property.
 */
export class AttackStepsSystem extends CardTargetSystem<IAttackProperties> {
    public override readonly name = 'attack';
    public override readonly eventName = EventName.Unnamed;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit, CardType.Base];
    protected override readonly defaultProperties: IAttackProperties = {
        targetCondition: () => true
    };

    public eventHandler(event, additionalProperties): void {
        const context = event.context;
        const target = event.target;

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (
            !EnumHelpers.isArena(properties.attacker.location) || !EnumHelpers.isAttackableLocation(target.location)
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
                (attack) => this.resolveAttack(attack, event.context)
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

    /** This method is checking whether cards are a valid target for an attack. */
    public override canAffect(targetCard: Card, context: AbilityContext, additionalProperties = {}): boolean {
        if (!('printedHp' in targetCard)) {
            return false; // cannot attack cards without printed HP
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (
            !Contract.assertNotNullLike(properties.attacker) ||
            !Contract.assertTrue(properties.attacker.isUnit()) ||
            !EnumHelpers.isArena(properties.attacker.location)
        ) {
            return false;
        }
        if (!super.canAffect(targetCard, context)) {
            return false;
        }
        if (targetCard === properties.attacker || targetCard.controller === properties.attacker.controller) {
            return false; // cannot attack yourself or your controller's cards
        }
        if (
            targetCard.hasRestriction(AbilityRestriction.BeAttacked, context) ||
            (properties.attacker as UnitCard).effectsPreventAttack(targetCard)
        ) {
            return false; // cannot attack cards with a BeAttacked restriction
        }

        const attackerLocation = properties.attacker.location === Location.GroundArena ? Location.GroundArena : Location.SpaceArena;
        const canTargetGround = attackerLocation === Location.GroundArena || context.source.hasEffect(EffectName.CanAttackGroundArenaFromSpaceArena);
        const canTargetSpace = attackerLocation === Location.SpaceArena || context.source.hasEffect(EffectName.CanAttackSpaceArenaFromGroundArena);
        if (
            targetCard.location !== attackerLocation &&
            targetCard.location !== Location.Base &&
            !(targetCard.location === Location.SpaceArena && canTargetSpace) &&
            !(targetCard.location === Location.GroundArena && canTargetGround)
        ) {
            return false; // can only attack same arena or base unless an effect allows otherwise
        }

        if (!properties.attacker.hasSomeKeyword(KeywordName.Saboteur)) { // If not Saboteur, do a Sentinel check
            if (targetCard.controller.getUnitsInPlay(attackerLocation, (card) => card.hasSomeKeyword(KeywordName.Sentinel)).length > 0) {
                return targetCard.hasSomeKeyword(KeywordName.Sentinel);
            }
        }

        return (
            properties.targetCondition(targetCard, context) &&
            EnumHelpers.isAttackableLocation(targetCard.location)
        );
    }

    public attackCosts(prompt, context: AbilityContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties = {}): void {
        const { target } = this.generatePropertiesFromContext(
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

    protected override addPropertiesToEvent(event, target, context: AbilityContext, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!Contract.assertTrue(properties.attacker.isUnit(), `Attacking card '${properties.attacker.internalName}' is not a unit`)) {
            return;
        }

        if (isArray(target)) {
            if (target.length !== 1) {
                context.game.addMessage(`Attack requires exactly one target, cannot attack ${target.length} targets`);
                return;
            }

            event.target = target[0];
        } else {
            event.target = target;
        }

        if (!Contract.assertTrue(event.target.isUnit() || event.target.isBase(), `Attack target card '${event.target.internalName}' is not a unit or base`)) {
            return;
        }

        event.context = context;
        event.attacker = properties.attacker;

        event.attack = new Attack(
            context.game,
            properties.attacker as UnitCard,
            event.target as CardWithDamageProperty
        );
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.target, event.context, additionalProperties);
    }

    private resolveAttack(attack: Attack, context: AbilityContext): void {
        // TODO: add more isValid() checks during the attack flow (if needed), and confirm that attack lasting effects still end correctly if any of them fail
        if (!attack.isValid()) {
            context.game.addMessage('The attack cannot proceed as the attacker or defender is no longer in play');
            return;
        }

        // event for damage dealt to target by attacker
        const damageEvents = [damage({ amount: attack.attackerTotalPower, isCombatDamage: true }).generateEvent(attack.target, context)];

        // event for damage dealt to attacker by defender, if any
        if (!attack.target.isBase()) {
            damageEvents.push(damage({ amount: attack.targetTotalPower, isCombatDamage: true }).generateEvent(attack.attacker, context));
        }

        context.game.openEventWindow(damageEvents);
    }

    // TODO ATTACKS: change attack effects so that they check the specific attack they are affecting,
    // in case we have have a situation when multiple attacks are happening in parallel but an effect
    // only applies to one of them.
    private registerAttackEffects(context: AbilityContext, properties: IAttackProperties, attack: Attack) {
        // create events for all effects to be generated
        const effectEvents: GameEvent[] = [];
        const effectsRegistered =
            this.queueCreateLastingEffectsGameSteps(Helpers.asArray(properties.attackerLastingEffects), attack.attacker, context, attack, effectEvents) ||
            this.queueCreateLastingEffectsGameSteps(Helpers.asArray(properties.defenderLastingEffects), attack.target, context, attack, effectEvents);

        if (effectsRegistered) {
            context.game.queueSimpleStep(() => context.game.openEventWindow(effectEvents), 'open event window for attack effects');
        }
    }

    /** @returns True if attack lasting effects were registered, false otherwise */
    private queueCreateLastingEffectsGameSteps(
        lastingEffects: IAttackLastingEffectPropertiesOrFactory[],
        target: Card,
        context: AbilityContext,
        attack: Attack,
        effectEvents: GameEvent[]
    ): boolean {
        if (lastingEffects == null || (Array.isArray(lastingEffects) && lastingEffects.length === 0)) {
            return false;
        }

        for (const lastingEffect of lastingEffects) {
            const lastingEffectProperties = typeof lastingEffect === 'function' ? lastingEffect(context, attack) : lastingEffect;

            const effectSystem = new CardLastingEffectSystem(Object.assign({}, lastingEffectProperties, {
                duration: Duration.UntilEndOfAttack,
                target: target,
                condition: lastingEffectProperties.condition == null ? null : (context: AbilityContext) => lastingEffectProperties.condition(attack, context)
            }));
            effectSystem.queueGenerateEventGameSteps(effectEvents, context);
        }

        return true;
    }
}
