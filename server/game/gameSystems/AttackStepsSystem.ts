import type { AbilityContext } from '../core/ability/AbilityContext';
import type { CardTypeFilter } from '../core/Constants';
import {
    AbilityRestriction,
    CardType,
    Duration,
    EffectName,
    KeywordName,
    MetaEventName,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
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
import type { IAttackableCard } from '../core/card/CardInterfaces';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { IOngoingCardEffectGenerator, KeywordNameOrProperties } from '../Interfaces';
import { KeywordInstance } from '../core/ability/KeywordInstance';
import type { MustAttackProperties } from '../core/ongoingEffect/effectImpl/MustAttackProperties';
import type { OngoingCardEffect } from '../core/ongoingEffect/OngoingCardEffect';
import type { OngoingPlayerEffect } from '../core/ongoingEffect/OngoingPlayerEffect';

export interface IAttackLastingEffectProperties<TContext extends AbilityContext = AbilityContext> {
    condition?: (attack: Attack, context: TContext) => boolean;
    effect: IOngoingCardEffectGenerator | IOngoingCardEffectGenerator[];
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

    /**
     * Overrides the default combat damage dealt by the attacker. By default, a unit deals damage equal to its power.
     */
    attackerCombatDamageOverride?: (attack: Attack, context: TContext) => number;

    /**
     * Effects to apply to the defender for the duration of the attack. Can be one or more {@link IAttackLastingEffectProperties}
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

    public eventHandler(event): void {
        const context: TContext = event.context;
        const target = event.target;
        const attacker = event.attacker;

        Contract.assertTrue(attacker.isUnit());
        if (!attacker.isInPlay()) {
            context.game.addMessage('The attack cannot proceed as the attacker is no longer in play');
            return;
        }
        if (Array.isArray(target)) {
            if (!target.some((card) => EnumHelpers.isAttackableZone(card.zoneName))) {
                context.game.addMessage('The attack cannot proceed as no defenders remain in play');
                return;
            }
        } else if (!EnumHelpers.isAttackableZone(target.zoneName)) {
            context.game.addMessage('The attack cannot proceed as the defender is no longer in play');
            return;
        }

        this.registerAttackEffects(context, event.attackerLastingEffects, event.defenderLastingEffects, event.attack);

        const attack: Attack = event.attack;
        context.game.addMessage('{0} attacks {1} with {2}', attack.attackingPlayer, this.getTargetMessage(attack.getAllTargets(), event.context), attack.attacker);
        context.game.queueStep(new AttackFlow(context, attack));
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IAttackProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        if (!properties.attacker) {
            properties.attacker = context.source;
        }
        return properties;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return [
            'initiate attack against {1} with {0}',
            [properties.attacker, this.getTargetMessage(properties.target, context)]
        ];
    }

    /** This method is checking whether cards are a valid target for an attack. */
    public override canAffectInternal(targetCard: Card, context: TContext, additionalProperties: Partial<IAttackProperties<TContext>> = {}): boolean {
        if (!targetCard.isUnit() && !targetCard.isBase()) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        Contract.assertNotNullLike(properties.attacker);
        Contract.assertTrue(properties.attacker.isUnit());

        if (!properties.attacker.isInPlay()) {
            return false;
        }
        if (!super.canAffectInternal(targetCard, context)) {
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
            if (targetCard.controller.hasSomeArenaUnit({ arena: attackerZone, keyword: KeywordName.Sentinel })) {
                return targetCard.hasSomeKeyword(KeywordName.Sentinel);
            }
        }

        const canAttackTarget = properties.targetCondition(targetCard, context) &&
          EnumHelpers.isAttackableZone(targetCard.zoneName);
        if (!canAttackTarget) {
            return false;
        }

        // If the target can be attack and the attacker has a "must attack" effect, ensure that the target meets the "must attack" condition
        if (properties.attacker.hasOngoingEffect(EffectName.MustAttack)) {
            const mustAttackProperties = properties.attacker.getOngoingEffectValues<MustAttackProperties>(EffectName.MustAttack)[0];
            const targetUnitIfAble = mustAttackProperties.targetUnitIfAble ?? false;
            if (!targetCard.isUnit() && targetUnitIfAble && targetCard.controller.hasSomeArenaUnit({ condition: (card) => this.canAffectInternal(card, context, additionalProperties) })) {
                return false;
            }
        }

        return true;
    }

    public attackCosts(prompt, context: TContext, additionalProperties: Partial<IAttackProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        properties.costHandler(context, prompt);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IAttackProperties<TContext>> = {}): void {
        const { attacker, target } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        );

        const cards = Helpers.asArray(target).filter((card) => this.canAffect(card, context));
        if (cards.length < 1) {
            return;
        }
        Contract.assertTrue(attacker.isUnit() && attacker.getMaxUnitAttackLimit() >= cards.length, 'Card cannot attack ' + cards.length + ' targets');

        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);
    }

    protected override addPropertiesToEvent(event, target: Card, context: TContext, additionalProperties: Partial<IAttackProperties<TContext>>): void {
        super.addPropertiesToEvent(event, target, context, additionalProperties);
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertTrue(properties.attacker.isUnit(), `Attacking card '${properties.attacker.internalName}' is not a unit`);

        if (isArray(target)) {
            const maxAttackTargetLimit = properties.attacker.getMaxUnitAttackLimit();
            if (target.length !== 1 && target.length > maxAttackTargetLimit) {
                context.game.addMessage(`Attacker can attack at most ${maxAttackTargetLimit} targets`);
                return;
            }

            for (const singleTarget of target) {
                Contract.assertTrue(singleTarget.isUnit() || singleTarget.isBase(), `Attack target card '${singleTarget.internalName}' is not a unit or base`);
            }

            event.target = target;
        } else {
            Contract.assertTrue(target.isUnit() || target.isBase(), `Attack target card '${target.internalName}' is not a unit or base`);
            event.target = [target];
        }

        event.attacker = properties.attacker;
        event.attack = new Attack(
            context.game,
            properties.attacker as IUnitCard,
            event.target as IAttackableCard[],
            properties.isAmbush,
            properties.attackerCombatDamageOverride
        );

        event.attackerLastingEffects = properties.attackerLastingEffects;
        event.defenderLastingEffects = properties.defenderLastingEffects;
    }

    public override checkEventCondition(event, additionalProperties: Partial<IAttackProperties<TContext>>): boolean {
        for (const target of Helpers.asArray(event.target)) {
            if (!this.canAffect(target, event.context, additionalProperties)) {
                return false;
            }
        }
        return true;
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
            attack.getAllTargets().map((target) => this.queueCreateLastingEffectsGameSteps(Helpers.asArray(defenderLastingEffects), target, context, attack, effectEvents))
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

    private attackerGainsSaboteur(attackTarget: IAttackableCard, context: TContext, additionalProperties?: Partial<IAttackProperties<TContext>>) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // If the attacker is blanked or has lost Saboteur, it cannot gain Saboteur
        const saboteur = new KeywordInstance(KeywordName.Saboteur, properties.attacker);
        if (saboteur.isBlank) {
            return false;
        }

        return this.attackerGains(attackTarget, context, additionalProperties, (effect) => {
            if (effect.impl.type !== EffectName.GainKeyword) {
                return false;
            }

            const keywordProps: KeywordNameOrProperties = effect.impl.getValue(properties.attacker);
            const keyword = typeof keywordProps === 'string' ? keywordProps : keywordProps.keyword;

            return keyword === KeywordName.Saboteur;
        });
    }

    private attackerGainsEffect(attackTarget: IAttackableCard, context: TContext, effect: EffectName, additionalProperties?: Partial<IAttackProperties<TContext>>) {
        return this.attackerGains(attackTarget, context, additionalProperties, (e) => e.impl.type === effect);
    }

    /** Checks if there are any lasting effects that would give the attacker Saboteur, for the purposes of targeting */
    private attackerGains(attackTarget: IAttackableCard, context: TContext, additionalProperties?: Partial<IAttackProperties<TContext>>, predicate: (effect: OngoingCardEffect | OngoingPlayerEffect) => boolean = () => false): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const attackerLastingEffects = Helpers.asArray(properties.attackerLastingEffects);
        if (attackerLastingEffects.length === 0) {
            return false;
        }

        // construct a hypothetical attack in case it's required for evaluating a condition on the lasting effect
        const attack = new Attack(
            context.game,
            properties.attacker as IUnitCard,
            [attackTarget],
            properties.isAmbush,
            properties.attackerCombatDamageOverride
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
