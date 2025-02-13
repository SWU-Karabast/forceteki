import type { AbilityContext } from '../core/ability/AbilityContext';
import type { CardTypeFilter } from '../core/Constants';
import { AbilityRestriction, CardType, Duration, EffectName, KeywordName, MetaEventName, WildcardCardType, ZoneName } from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { Attack } from '../core/attack/Attack';
import { AttackFlow } from '../core/attack/AttackFlow';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { Card } from '../core/card/Card';
import { isArray } from 'underscore';
import type { GameEvent } from '../core/event/GameEvent';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';
import type { KeywordInstance } from '../core/ability/KeywordInstance';
import type { IAttackableCard } from '../core/card/CardInterfaces';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IAttackLastingEffectProperties<TContext extends AbilityContext = AbilityContext> {
    condition?: (attack: Attack, context: TContext) => boolean;
    effect?: any;
}

type IAttackLastingEffectPropertiesOrFactory<TContext extends AbilityContext = AbilityContext> = IAttackLastingEffectProperties<TContext> | ((context: TContext, attack: Attack) => IAttackLastingEffectProperties<TContext>);

export interface IAttackProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    attacker?: Card;
    targetCondition?: (card: Card, context: TContext) => boolean;
    message?: string;
    messageArgs?: (attack: Attack, context: TContext) => any | any[];
    costHandler?: (context: TContext, prompt: any) => void;
    isAmbush?: boolean;

    /**
     * Effects to apply to the attacker for the duration of the attack. Can be one or more {@link IAttackLastingEffectProperties}
     * or a function generator(s) for them.
     */
    attackerLastingEffects?: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[];

    // TODO: allow declaring multiple attackers (new Maul)
    /**
     * Effects to apply to the attacker for the duration of the attack. Can be one or more {@link IAttackLastingEffectProperties}
     * or a function generator(s) for them.
     */
    defenderLastingEffects?: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[];
}

/**
 * Manages the concrete steps of the attack process, emitting events at the appropriate stages.
 * Does not manage the exhaust cost. The attacker must already be selected and set via the `attacker` property.
 */
export class AttackStepsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IAttackProperties<TContext>> {
    public override readonly name = 'attack';
    public override readonly eventName = MetaEventName.AttackSteps;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit, CardType.Base];
    protected override readonly defaultProperties: IAttackProperties<TContext> = {
        targetCondition: () => true
    };

    public eventHandler(event, additionalProperties): void {
        const context = event.context;
        const target = event.target;
        const attacker = event.attacker;

        Contract.assertTrue(attacker.isUnit());
        if (!attacker.isInPlay() || !EnumHelpers.isAttackableZone(target.zoneName)) {
            context.game.addMessage('The attack cannot proceed as the attacker or defender is no longer in play');
            return;
        }

        this.registerAttackEffects(context, event.attackerLastingEffects, event.defenderLastingEffects, event.attack);

        const attack = event.attack;
        context.game.queueStep(new AttackFlow(context, attack));
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!properties.attacker) {
            properties.attacker = context.source;
        }
        return properties;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            '{0} initiates attack against {1}',
            [properties.attacker, properties.target]
        ];
    }

    /** This method is checking whether cards are a valid target for an attack. */
    public override canAffect(targetCard: Card, context: TContext, additionalProperties = {}): boolean {
        if (!targetCard.isUnit() || !targetCard.isBase()) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        Contract.assertNotNullLike(properties.attacker);
        Contract.assertTrue(properties.attacker.isUnit());

        if (!properties.attacker.isInPlay()) {
            return false;
        }
        if (!super.canAffect(targetCard, context)) {
            return false;
        }
        if (targetCard === properties.attacker || targetCard.controller === properties.attacker.controller) {
            return false; // cannot attack yourself or your controller's cards
        }
        if ( // sentinel keyword overrides "can't be attacked" abilities (SWU Comp Rules 2.0 7.5.11.D)
            ((targetCard.hasRestriction(AbilityRestriction.BeAttacked, context) && !targetCard.hasSomeKeyword(KeywordName.Sentinel)) ||
              properties.attacker.effectsPreventAttack(targetCard))
        ) {
            return false; // cannot attack cards with a BeAttacked restriction
        }

        const attackerZone = properties.attacker.zoneName === ZoneName.GroundArena ? ZoneName.GroundArena : ZoneName.SpaceArena;
        const canTargetGround = attackerZone === ZoneName.GroundArena || context.source.hasOngoingEffect(EffectName.CanAttackGroundArenaFromSpaceArena) || this.attackerGainsEffect(targetCard, context, EffectName.CanAttackGroundArenaFromSpaceArena, additionalProperties);
        const canTargetSpace = attackerZone === ZoneName.SpaceArena || context.source.hasOngoingEffect(EffectName.CanAttackSpaceArenaFromGroundArena) || this.attackerGainsEffect(targetCard, context, EffectName.CanAttackSpaceArenaFromGroundArena, additionalProperties);
        if (
            targetCard.zoneName !== attackerZone &&
            targetCard.zoneName !== ZoneName.Base &&
            !(targetCard.zoneName === ZoneName.SpaceArena && canTargetSpace) &&
            !(targetCard.zoneName === ZoneName.GroundArena && canTargetGround)
        ) {
            return false; // can only attack same arena or base unless an effect allows otherwise
        }

        // If not Saboteur, do a Sentinel check
        const attackerHasSaboteur =
            properties.attacker.hasSomeKeyword(KeywordName.Saboteur) ||
            this.attackerGainsSaboteur(targetCard, context, additionalProperties);
        if (!attackerHasSaboteur) {
            if (targetCard.controller.getUnitsInPlay(attackerZone, (card) => card.hasSomeKeyword(KeywordName.Sentinel)).length > 0) {
                return targetCard.hasSomeKeyword(KeywordName.Sentinel);
            }
        }

        return (
            properties.targetCondition(targetCard, context) &&
            EnumHelpers.isAttackableZone(targetCard.zoneName)
        );
    }

    public attackCosts(prompt, context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const { target } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        );

        const cards = Helpers.asArray(target).filter((card) => this.canAffect(card, context));
        if (cards.length !== 1) {
            return;
        }

        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);
    }

    protected override addPropertiesToEvent(event, target, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, target, context, additionalProperties);
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertTrue(properties.attacker.isUnit(), `Attacking card '${properties.attacker.internalName}' is not a unit`);

        if (isArray(target)) {
            if (target.length !== 1) {
                context.game.addMessage(`Attack requires exactly one target, cannot attack ${target.length} targets`);
                return;
            }

            event.target = target[0];
        } else {
            event.target = target;
        }

        Contract.assertTrue(event.target.isUnit() || event.target.isBase(), `Attack target card '${event.target.internalName}' is not a unit or base`);

        event.attacker = properties.attacker;
        event.attack = new Attack(
            context.game,
            properties.attacker as IUnitCard,
            event.target as IAttackableCard,
            properties.isAmbush
        );

        event.attackerLastingEffects = properties.attackerLastingEffects;
        event.defenderLastingEffects = properties.defenderLastingEffects;
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.target, event.context, additionalProperties);
    }

    // TODO ATTACKS: change attack effects so that they check the specific attack they are affecting,
    // in case we have have a situation when multiple attacks are happening in parallel but an effect
    // only applies to one of them.
    private registerAttackEffects(
        context: TContext,
        attackerLastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[],
        defenderLastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[],
        attack: Attack) {
        // create events for all effects to be generated
        const effectEvents: GameEvent[] = [];
        const effectsRegistered = [
            this.queueCreateLastingEffectsGameSteps(Helpers.asArray(attackerLastingEffects), attack.attacker, context, attack, effectEvents),
            this.queueCreateLastingEffectsGameSteps(Helpers.asArray(defenderLastingEffects), attack.target, context, attack, effectEvents)
        ].some((result) => result);

        if (effectsRegistered) {
            context.game.queueSimpleStep(() => context.game.openEventWindow(effectEvents), 'open event window for attack effects');
        }
    }

    /** @returns True if attack lasting effects were registered, false otherwise */
    private queueCreateLastingEffectsGameSteps(
        lastingEffects: IAttackLastingEffectPropertiesOrFactory[],
        target: Card,
        context: TContext,
        attack: Attack,
        effectEvents: GameEvent[]
    ): boolean {
        if (lastingEffects == null || (Array.isArray(lastingEffects) && lastingEffects.length === 0)) {
            return false;
        }

        for (const lastingEffect of lastingEffects) {
            const effectSystem = this.buildCardLastingEffectSystem(lastingEffect, context, attack, target);
            effectSystem.queueGenerateEventGameSteps(effectEvents, context);
        }

        return true;
    }

    private attackerGainsSaboteur(attackTarget: IAttackableCard, context: TContext, additionalProperties?: any) {
        return this.attackerGains(attackTarget, context, additionalProperties, (effect) => effect.impl.type === EffectName.GainKeyword && (effect.impl.valueWrapper.value as KeywordInstance).name === KeywordName.Saboteur);
    }

    private attackerGainsEffect(attackTarget: IAttackableCard, context: TContext, effect: EffectName, additionalProperties?: any) {
        return this.attackerGains(attackTarget, context, additionalProperties, (e) => e.impl.type === effect);
    }

    /** Checks if there are any lasting effects that would give the attacker Saboteur, for the purposes of targeting */
    private attackerGains(attackTarget: IAttackableCard, context: TContext, additionalProperties?: any, predicate = (e) => false): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const attackerLastingEffects = Helpers.asArray(properties.attackerLastingEffects);
        if (attackerLastingEffects.length === 0) {
            return false;
        }

        // construct a hypothetical attack in case it's required for evaluating a condition on the lasting effect
        const attack = new Attack(
            context.game,
            properties.attacker as IUnitCard,
            attackTarget,
            properties.isAmbush
        );

        for (const attackerLastingEffect of attackerLastingEffects) {
            const effectSystem = this.buildCardLastingEffectSystem(attackerLastingEffect, context, attack, attackTarget);
            const applicableEffects = effectSystem.getApplicableEffects(properties.attacker, context);

            for (const effect of applicableEffects) {
                if (predicate(effect)) {
                    return true;
                }
            }
        }

        return false;
    }

    private buildCardLastingEffectSystem(lastingEffect: IAttackLastingEffectPropertiesOrFactory<TContext>, context: TContext, attack: Attack, target: Card) {
        const lastingEffectProperties = typeof lastingEffect === 'function' ? lastingEffect(context, attack) : lastingEffect;

        return new CardLastingEffectSystem({
            ...lastingEffectProperties,
            duration: Duration.UntilEndOfAttack,
            target: target,
            condition: lastingEffectProperties.condition == null ? null : (context: TContext) => lastingEffectProperties.condition(attack, context)
        });
    }
}
