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
import { EnumHelpers } from '../core/utils/EnumHelpers';
import { Attack } from '../core/attack/Attack';
import { AttackFlow } from '../core/attack/AttackFlow';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { Card } from '../core/card/Card';
import { isArray } from 'underscore';
import type { GameEvent } from '../core/event/GameEvent';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { IAttackableCard } from '../core/card/CardInterfaces';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { IOngoingCardEffectGenerator } from '../Interfaces';
import type { MustAttackProperties } from '../core/ongoingEffect/effectImpl/MustAttackProperties';
import type { FormatMessage } from '../core/chat/GameChat';

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

        const { attackerEffects, defenderEffects } = this.registerAttackEffects(context, event.attackerLastingEffects, event.defenderLastingEffects, event.attack);

        const attack: Attack = event.attack;

        const attackMessage: FormatMessage[] = [
            {
                format: '{0} attacks {1} with {2}{3}',
                args: [
                    attack.attackingPlayer,
                    this.getTargetMessage(attack.getAllTargets(), event.context),
                    attack.attacker,
                    attack.attackerDealsCombatDamageFirst() ? ' (dealing damage before the defender)' : ''
                ]
            },
        ];

        const effectMessage: FormatMessage[] = [];
        if (attackerEffects != null) {
            const [message, args] = attackerEffects.getEffectMessage(context);
            effectMessage.push({ format: message, args: Helpers.asArray(args) });
        }

        for (const target of attack.getAllTargets()) {
            const defenderEffect = defenderEffects.get(target);
            if (defenderEffect) {
                const [message, args] = defenderEffect.getEffectMessage(context);
                effectMessage.push({ format: message, args: Helpers.asArray(args) });
            }
        }

        if (effectMessage.length > 0 && context.ability?.isAttackAction() && context.ability.initiateAttackSource) {
            attackMessage.push({ format: 'uses {0} to {1}',
                args: [
                    context.ability.initiateAttackSource,
                    { format: ChatHelpers.formatWithLength(effectMessage.length, 'to '), args: effectMessage }
                ] });
        }

        context.game.addMessage(ChatHelpers.formatWithLength(attackMessage.length), ...attackMessage);
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
        if (!targetCard.isBase() && (!targetCard.isUnit() || !targetCard.isInPlay())) {
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
              properties.attacker.effectsPreventAttack(targetCard, context))
        ) {
            return false; // cannot attack cards with a BeAttacked restriction
        }

        // Per CR 6.3.1.1, abilities granted by a modified "Attack With a Unit" action are active at "Declare Intent",
        // before this legality check runs. InitiateAttackSystem applies unconditional attacker lasting effects up front,
        // so we can read them directly off the attacker here.
        const attackerZone = properties.attacker.zoneName === ZoneName.GroundArena ? ZoneName.GroundArena : ZoneName.SpaceArena;
        const canTargetGround = attackerZone === ZoneName.GroundArena || properties.attacker.hasOngoingEffect(EffectName.CanAttackGroundArenaFromSpaceArena);
        const canTargetSpace = attackerZone === ZoneName.SpaceArena || properties.attacker.hasOngoingEffect(EffectName.CanAttackSpaceArenaFromGroundArena);
        if (
            targetCard.zoneName !== attackerZone &&
            targetCard.zoneName !== ZoneName.Base &&
            !(targetCard.zoneName === ZoneName.SpaceArena && canTargetSpace) &&
            !(targetCard.zoneName === ZoneName.GroundArena && canTargetGround)
        ) {
            return false; // can only attack same arena or base unless an effect allows otherwise
        }

        // If not Saboteur, do a Sentinel check
        const attackerHasSaboteur = properties.attacker.hasSomeKeyword(KeywordName.Saboteur);
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
        context.activeAttackId = event.attack.id;

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
        attack: Attack
    ): { attackerEffects?: CardLastingEffectSystem; defenderEffects: Map<Card, CardLastingEffectSystem> } {
        // Unconditional, non-factory attacker effects are applied earlier by InitiateAttackSystem so they're
        // active at "Declare Intent" (CR 6.3.1.1). Only factory-form or conditional entries can be applied here,
        // because they depend on the chosen target or other attack details that aren't finalized until now.
        const allAttackerEntries = Helpers.asArray(attackerLastingEffects);
        const lateAttackerEntries = AttackStepsSystem.partitionLateAttackerLastingEffects(attackerLastingEffects);

        // create events for all effects to be generated
        const effectEvents: GameEvent[] = [];
        const lateAttackerEffects = this.queueCreateLastingEffectsGameSteps(lateAttackerEntries, attack.attacker, context, attack, effectEvents);
        let effectsRegistered = lateAttackerEffects != null;
        const defenderEffectsMap = new Map<Card, CardLastingEffectSystem>();
        for (const target of attack.getAllTargets()) {
            const defenderEffects = this.queueCreateLastingEffectsGameSteps(Helpers.asArray(defenderLastingEffects), target, context, attack, effectEvents);
            effectsRegistered = effectsRegistered || defenderEffects != null;
            if (defenderEffects) {
                defenderEffectsMap.set(target, defenderEffects);
            }
        }

        if (effectsRegistered) {
            context.game.queueSimpleStep(() => context.game.openEventWindow(effectEvents), 'open event window for attack effects');
        }

        // For the chat summary, build a non-queued system that covers every attacker entry (including the ones
        // applied early by InitiateAttackSystem) so the message lists the full set of granted effects. Skip when
        // nothing would apply to the attacker (e.g. blanked) — matching legacy behavior of suppressing the message.
        let attackerEffects: CardLastingEffectSystem | undefined;
        if (allAttackerEntries.length > 0) {
            const messageSystem = this.buildCardLastingEffectSystem(allAttackerEntries, context, attack, attack.attacker);
            if (messageSystem.getApplicableEffects(attack.attacker, context).length > 0) {
                attackerEffects = messageSystem;
            }
        }

        return { attackerEffects, defenderEffects: defenderEffectsMap };
    }

    /** @returns True if attack lasting effects were registered, false otherwise */
    private queueCreateLastingEffectsGameSteps(
        lastingEffects: IAttackLastingEffectPropertiesOrFactory[],
        target: Card,
        context: TContext,
        attack: Attack,
        effectEvents: GameEvent[]
    ): CardLastingEffectSystem | null {
        if (lastingEffects == null || (Array.isArray(lastingEffects) && lastingEffects.length === 0)) {
            return null;
        }

        const effectSystem = this.buildCardLastingEffectSystem(lastingEffects, context, attack, target);
        if (effectSystem.getApplicableEffects(target, context).length === 0) {
            return null;
        }

        effectSystem.queueGenerateEventGameSteps(effectEvents, context);

        return effectSystem;
    }

    /**
     * Returns the subset of attacker lasting effects that depend on the chosen target or some other aspect of
     * the attack object itself (factory-form or conditional).
     *
     * Used by {@link registerAttackEffects} to skip entries that were applied earlier at Declare Intent.
     */
    private static partitionLateAttackerLastingEffects<TContext extends AbilityContext>(
        attackerLastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[] | undefined
    ): IAttackLastingEffectPropertiesOrFactory<TContext>[] {
        return Helpers.asArray(attackerLastingEffects).filter((entry) =>
            typeof entry === 'function' || entry.condition != null
        );
    }

    /**
     * Returns the subset of attacker lasting effects that can be applied before target selection — entries
     * that are neither factory functions nor carry an attack-dependent condition.
     */
    private static partitionEarlyAttackerLastingEffects<TContext extends AbilityContext>(
        attackerLastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[] | undefined
    ): IAttackLastingEffectProperties<TContext>[] {
        return Helpers.asArray(attackerLastingEffects).filter((entry): entry is IAttackLastingEffectProperties<TContext> =>
            typeof entry !== 'function' && entry.condition == null
        );
    }

    /**
     * Applies attacker lasting effects at "Declare Intent" of a modified attack action (CR 6.3.1.1), so that they're
     * active during target legality checks performed by {@link canAffectInternal}. Only entries that don't depend on
     * the chosen target (no factory, no condition) are applied here; the rest run later in {@link registerAttackEffects}.
     */
    public static queueEarlyAttackerLastingEffects<TContext extends AbilityContext>(
        context: TContext,
        attacker: Card,
        attackerLastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext> | IAttackLastingEffectPropertiesOrFactory<TContext>[] | undefined
    ): void {
        const entries = AttackStepsSystem.partitionEarlyAttackerLastingEffects(attackerLastingEffects);
        if (entries.length === 0) {
            return;
        }

        const effectSystem = new CardLastingEffectSystem<TContext>({
            duration: Duration.UntilEndOfAttack,
            target: attacker,
            effect: entries.flatMap((entry) => Helpers.asArray(entry.effect))
        });

        if (effectSystem.getApplicableEffects(attacker, context).length === 0) {
            return;
        }

        const effectEvents: GameEvent[] = [];
        effectSystem.queueGenerateEventGameSteps(effectEvents, context);
        context.game.queueSimpleStep(() => context.game.openEventWindow(effectEvents), 'open event window for early attacker lasting effects');
    }

    private buildCardLastingEffectSystem(lastingEffects: IAttackLastingEffectPropertiesOrFactory<TContext>[], context: TContext, attack: Attack, target: Card) {
        return new CardLastingEffectSystem({
            duration: Duration.UntilEndOfAttack,
            target: target,
            effect: lastingEffects
                .map((lastingEffect) => (typeof lastingEffect === 'function' ? lastingEffect(context, attack) : lastingEffect))
                .flatMap((lastingEffectProperties) => {
                    return Helpers.asArray(lastingEffectProperties.effect).map((factory) => {
                        return (game, source, props) => factory(game, source, {
                            ...props,
                            condition: lastingEffectProperties.condition == null
                                ? props.condition
                                : (context: TContext) => lastingEffectProperties.condition(attack, context) && (props.condition == null ? true : props.condition(context)),
                        });
                    });
                }),
        });
    }
}
