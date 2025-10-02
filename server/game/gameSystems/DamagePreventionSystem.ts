import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import type { Card } from '../core/card/Card';
import type { RelativePlayer } from '../core/Constants';
import { DamagePreventionType, DamageType } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { GameSystem } from '../core/gameSystem/GameSystem';
import type { DamageSourceType } from '../IDamageOrDefeatSource';
import type { IReplacementEffectAbilityProps } from '../Interfaces';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import * as Contract from '../core/utils/Contract';
import { DamageSystem } from './DamageSystem';

export interface IDamagePreventionSystemProperties extends Omit<IReplacementEffectAbilityProps, 'when'> {
    preventionType: DamagePreventionType;
    preventDamageFromSource?: RelativePlayer; // TSTODO - update to accept an array
    preventDamageFrom?: DamageSourceType;
    preventionAmount?: number;
    triggerCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean; // This can be used to further limit what damage is prevented in addition to the default 'when' checks
}

export class DamagePreventionSystem<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> extends ReplacementEffectSystem<TContext, IDamagePreventionSystemProperties> {
    public override readonly eventName = MetaEventName.ReplacementEffect;

    // public override eventHandler(event, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}): void {
    //     const triggerWindow = event.context.replacementEffectWindow;

    //     Contract.assertNotNullLike(triggerWindow, `Replacement effect '${this} resolving outside of any trigger window`);
    //     Contract.assertTrue(
    //         triggerWindow.triggerAbilityType === AbilityType.ReplacementEffect,
    //         `Replacement effect '${this} resolving in trigger window of type ${triggerWindow.triggerAbilityType}`
    //     );

    //     const eventBeingReplaced = event.context.event;

    //     const replacementImmediateEffect = event.replacementImmediateEffect;
    //     if (replacementImmediateEffect) {
    //         const eventWindow = eventBeingReplaced.window;
    //         const events = [];

    //         replacementImmediateEffect.queueGenerateEventGameSteps(
    //             events,
    //             event.context,
    //             { ...additionalProperties, replacementEffect: true }
    //         );

    //         event.context.game.queueSimpleStep(() => {
    //             Contract.assertFalse(events.length === 0, `Replacement effect ${replacementImmediateEffect} for ${event.name} did not generate any events`);

    //             events.forEach((replacementEvent) => {
    //                 replacementEvent.order = eventBeingReplaced.order;
    //                 event.context.game.queueSimpleStep(() => {
    //                     eventBeingReplaced.setReplacementEvent(replacementEvent);
    //                     eventWindow.addEvent(replacementEvent);
    //                     triggerWindow.addReplacementEffectEvent(replacementEvent);
    //                 }, 'replacementEffect: replace window event');
    //             });
    //         }, 'replacementEffect: add replacement event to window');
    //     }

    //     event.context.cancel();
    // }

    // public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}) {
    //     const event = this.createEvent(null, context, additionalProperties);

    //     this.addPropertiesToEvent(event, null, context, additionalProperties);
    //     event.setHandler((event) => this.eventHandler(event, additionalProperties));

    //     events.push(event);
    // }

    // public override getEffectMessage(context: TContext): [string, any[]] {
    //     const { replacementImmediateEffect, effect } = this.generatePropertiesFromContext(context);
    //     if (effect) {
    //         return [effect, []];
    //     }
    //     if (replacementImmediateEffect) {
    //         return ['{0} instead of {1}', [replacementImmediateEffect.getEffectMessage(context), this.getTargetMessage(context.event.card, context)]];
    //     }
    //     return ['cancel the effects of {0}', [this.getTargetMessage(context.event.card, context)]];
    // }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        return properties;
    }

    // public override addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties?: Partial<IDamagePreventionSystemProperties>): void {
    //     super.addPropertiesToEvent(event, target, context, additionalProperties);

    //     const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
    //     event.replacementImmediateEffect = properties.replacementImmediateEffect;
    // }

    protected override getReplacementImmediateEffect(context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}): GameSystem<TContext> {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IDamagePreventionSystemProperties;

        switch (properties.preventionType) {
            case DamagePreventionType.All:
                return null; // Ignore all damage
            case DamagePreventionType.Reduce:
                Contract.assertPositiveNonZero(properties.preventionAmount, 'preventionAmount must be a positive non-zero number for DamagePreventionType.Reduce');
                return new DamageSystem((context) => ({
                    target: context.source,
                    amount: Math.max(context.event.amount - properties.preventionAmount, 0),
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy.Opponent, // Copied this from Cassian - why is it capitalized?
                    type: context.event.type,
                }));
            default:
                Contract.fail(`Invalid preventionType ${properties.preventionType} for DamagePreventionSystem`);
        }
    }

    // public override hasLegalTarget(context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}, _mustChangeGameState): boolean {
    //     Contract.assertNotNullLike(context.event);

    //     if (!context.event.canResolve) {
    //         return false;
    //     }

    //     const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);

    //     return (
    //         (!replacementGameAction || replacementGameAction.hasLegalTarget(context, additionalProperties, GameStateChangeRequired.None))
    //     );
    // }

    // public override defaultTargets(context: TContext): any[] {
    //     return context.event.card ? [context.event.card] : [];
    // }

    // public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}): boolean {
    //     const { replacementImmediateEffect: replacementGameAction } = this.generatePropertiesFromContext(context);
    //     return (
    //         replacementGameAction &&
    //         replacementGameAction.hasTargetsChosenByPlayer(context, player, additionalProperties)
    //     );
    // }

    // // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    // protected override isTargetTypeValid(target: GameObject): boolean {
    //     return false;
    // }

    // protected override canAffectInternal(target: GameObject, context: TContext, additionalProperties: Partial<IDamagePreventionSystemProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
    //     return this.isTargetTypeValid(target);
    // }
}