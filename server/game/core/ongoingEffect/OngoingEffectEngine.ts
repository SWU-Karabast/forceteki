import { Duration, EffectName, EventName } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type { OngoingEffect } from './OngoingEffect';
import type { OngoingEffectSource } from './OngoingEffectSource';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';

interface ICustomDurationEvent {
    name: string;
    handler: (...args: any[]) => void;
    effect: OngoingEffect;
}

export class OngoingEffectEngine {
    public events: EventRegistrar;
    public effects: OngoingEffect[] = [];
    public customDurationEvents: ICustomDurationEvent[] = [];
    public effectsChangedSinceLastCheck = false;

    public constructor(private game: Game) {
        this.events = new EventRegistrar(game, this);
        this.events.register([
            EventName.OnAttackCompleted,
            EventName.OnPhaseEnded,
            EventName.OnRoundEnded
        ]);
    }

    public add(effect: OngoingEffect) {
        this.effects.push(effect);
        if (effect.duration === Duration.Custom) {
            this.registerCustomDurationEvents(effect);
        }
        this.effectsChangedSinceLastCheck = true;
        return effect;
    }

    public checkDelayedEffects(events: GameEvent[]) {
        const effectsToTrigger: OngoingEffect[] = [];
        const effectsToRemove: OngoingEffect[] = [];
        for (const effect of this.effects.filter(
            (effect) => effect.isEffectActive() && effect.impl.type === EffectName.DelayedEffect
        )) {
            const properties = effect.impl.getValue();
            if (properties.condition) {
                if (properties.condition(effect.context)) {
                    effectsToTrigger.push(effect);
                }
            } else {
                const triggeringEvents = events.filter((event) => properties.when[event.name]);
                if (triggeringEvents.length > 0) {
                    if (triggeringEvents.some((event) => properties.when[event.name](event, effect.context))) {
                        effectsToTrigger.push(effect);
                    }
                }
            }
        }
        const effectTriggers = effectsToTrigger.map((effect) => {
            const properties = effect.impl.getValue();
            const context = effect.context;
            const targets = effect.targets;
            return {
                title: context.source.title + '\'s effect' + (targets.length === 1 ? ' on ' + targets[0].name : ''),
                handler: () => {
                    // TODO Ensure the below line doesn't break anything for a CardTargetSystem delayed effect
                    properties.immediateEffect.setDefaultTargetFn(() => targets);
                    if (properties.message && properties.immediateEffect.hasLegalTarget(context)) {
                        let messageArgs = properties.messageArgs || [];
                        if (typeof messageArgs === 'function') {
                            messageArgs = messageArgs(context, targets);
                        }
                        this.game.addMessage(properties.message, ...messageArgs);
                    }
                    const actionEvents = [];
                    properties.immediateEffect.queueGenerateEventGameSteps(actionEvents, context);
                    properties.limit.increment(context.source.owner);
                    this.game.queueSimpleStep(() => this.game.openEventWindow(actionEvents), 'openDelayedActionsWindow');
                    this.game.queueSimpleStep(() => this.game.resolveGameState(true), 'resolveGameState');
                }
            };
        });
        for (const effect of this.effects.filter(
            (effect) => effect.isEffectActive() && effect.impl.type === EffectName.DelayedEffect
        )) {
            const properties = effect.impl.getValue();
            const triggeringEvents = events.filter((event) => properties.when[event.name]);

            if (triggeringEvents.length > 0) {
                if (properties.limit.isAtMax(effect.source.owner)) {
                    effectsToRemove.push(effect);
                }
            }
        }
        if (effectTriggers.length > 0) {
            // TODO Implement the correct trigger window. We may need a subclass of TriggeredAbilityWindow for multiple simultaneous effects
            effectTriggers.forEach((trigger) => {
                trigger.handler();
            });
        }
        if (effectsToRemove.length > 0) {
            this.unapplyAndRemove((effect) => effectsToRemove.includes(effect));
        }
    }

    public removeLastingEffects(card: OngoingEffectSource) {
        this.unapplyAndRemove(
            (effect) => {
                if (effect.impl.type === 'delayedEffect') {
                    const effectImplValue = effect.impl.getValue();
                    const limit = effectImplValue.limit;

                    return limit.isAtMax(effect.source.controller);
                }

                if (effect.duration !== Duration.Persistent) {
                    return effect.matchTarget === card;
                }

                return false;
            }
        );
    }

    public resolveEffects(prevStateChanged = false, loops = 0) {
        if (!prevStateChanged && !this.effectsChangedSinceLastCheck) {
            return false;
        }
        let stateChanged = false;
        this.effectsChangedSinceLastCheck = false;
        // Check each effect's condition and find new targets
        stateChanged = this.effects.reduce((stateChanged, effect) => effect.resolveEffectTargets(stateChanged), stateChanged);
        if (loops === 10) {
            throw new Error('OngoingEffectEngine.resolveEffects looped 10 times');
        } else {
            this.resolveEffects(stateChanged, loops + 1);
        }
        return stateChanged;
    }

    public unapplyAndRemove(match: (effect: OngoingEffect) => boolean) {
        let anyEffectRemoved = false;
        const remainingEffects: OngoingEffect[] = [];
        for (const effect of this.effects) {
            if (match(effect)) {
                anyEffectRemoved = true;
                effect.cancel();
                if (effect.duration === Duration.Custom) {
                    this.unregisterCustomDurationEvents(effect);
                }
            } else {
                remainingEffects.push(effect);
            }
        }
        this.effects = remainingEffects;
        return anyEffectRemoved;
    }

    private onAttackCompleted() {
        this.effectsChangedSinceLastCheck = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfAttack);
    }

    private onPhaseEnded() {
        this.effectsChangedSinceLastCheck = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfPhase);
    }

    private onRoundEnded() {
        this.effectsChangedSinceLastCheck = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfRound);
    }

    private registerCustomDurationEvents(effect: OngoingEffect) {
        if (!effect.until) {
            return;
        }

        const handler = this.createCustomDurationHandler(effect);
        for (const eventName of Object.keys(effect.until)) {
            this.customDurationEvents.push({
                name: eventName,
                handler: handler,
                effect: effect
            });
            this.game.on(eventName, handler);
        }
    }

    private unregisterCustomDurationEvents(effect: OngoingEffect) {
        const remainingEvents: ICustomDurationEvent[] = [];
        for (const event of this.customDurationEvents) {
            if (event.effect === effect) {
                this.game.removeListener(event.name, event.handler);
            } else {
                remainingEvents.push(event);
            }
        }
        this.customDurationEvents = remainingEvents;
    }

    private createCustomDurationHandler(customDurationEffect) {
        return (...args) => {
            const event = args[0];
            const listener = customDurationEffect.until[event.name];
            if (listener && listener(...args)) {
                customDurationEffect.cancel();
                this.unregisterCustomDurationEvents(customDurationEffect);
                this.effects = this.effects.filter((effect) => effect !== customDurationEffect);
            }
        };
    }

    public getDebugInfo() {
        return this.effects.map((effect) => effect.getDebugInfo());
    }
}
