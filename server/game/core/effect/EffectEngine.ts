import { Duration, EffectName, EventName } from '../Constants';
import type Effect from './Effect';
import type EffectSource from './EffectSource';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';

export class EffectEngine {
    events: EventRegistrar;
    effects: Effect[] = [];
    customDurationEvents = [];
    newEffect = false;

    constructor(private game: Game) {
        this.events = new EventRegistrar(game, this);
        this.events.register([
            EventName.OnPhaseEnded,
            EventName.OnRoundEnded,
            EventName.OnAttackCompleted,
            EventName.OnPassActionPhasePriority // TODO: should this be taking initiative?
        ]);
    }

    add(effect: Effect) {
        this.effects.push(effect);
        if (effect.duration === Duration.Custom) {
            this.registerCustomDurationEvents(effect);
        }
        this.newEffect = true;
        return effect;
    }

    checkDelayedEffects(events: any[]) {
        let effectsToTrigger = [];
        const effectsToRemove = [];
        for (const effect of this.effects.filter(
            (effect) => effect.isEffectActive() && effect.effect.type === EffectName.DelayedEffect
        )) {
            const properties = effect.effect.getValue();
            if (properties.condition) {
                if (properties.condition(effect.context)) {
                    effectsToTrigger.push(effect);
                }
            } else {
                const triggeringEvents = events.filter((event) => properties.when[event.name]);
                if (triggeringEvents.length > 0) {
                    if (!properties.multipleTrigger && effect.duration !== Duration.Persistent) {
                        effectsToRemove.push(effect);
                    }
                    if (triggeringEvents.some((event) => properties.when[event.name](event, effect.context))) {
                        effectsToTrigger.push(effect);
                    }
                }
            }
        }
        effectsToTrigger = effectsToTrigger.map((effect) => {
            const properties = effect.effect.getValue();
            const context = effect.context;
            const targets = effect.targets;
            return {
                title: context.source.name + '\'s effect' + (targets.length === 1 ? ' on ' + targets[0].name : ''),
                handler: () => {
                    properties.gameAction.setDefaultTarget(() => targets);
                    if (properties.message && properties.gameAction.hasLegalTarget(context)) {
                        let messageArgs = properties.messageArgs || [];
                        if (typeof messageArgs === 'function') {
                            messageArgs = messageArgs(context, targets);
                        }
                        this.game.addMessage(properties.message, ...messageArgs);
                    }
                    const actionEvents = [];
                    properties.gameAction.addEventsToArray(actionEvents, context);
                    this.game.queueSimpleStep(() => this.game.openThenEventWindow(actionEvents));
                    this.game.queueSimpleStep(() => context.refill());
                }
            };
        });
        if (effectsToRemove.length > 0) {
            this.unapplyAndRemove((effect) => effectsToRemove.includes(effect));
        }
        if (effectsToTrigger.length > 0) {
            this.game.openSimultaneousEffectWindow(effectsToTrigger);
        }
    }

    removeLastingEffects(card: EffectSource) {
        this.unapplyAndRemove(
            (effect) =>
                effect.match === card &&
                effect.duration !== Duration.Persistent &&
                !effect.canChangeZoneOnce &&
                (!effect.canChangeZoneNTimes || effect.canChangeZoneNTimes === 0)
        );
        for (const effect of this.effects) {
            if (effect.match === card && effect.canChangeZoneOnce) {
                effect.canChangeZoneOnce = false;
            }
            if (effect.match === card && effect.canChangeZoneNTimes > 0) {
                effect.canChangeZoneNTimes--;
            }
        }
    }

    checkEffects(prevStateChanged = false, loops = 0) {
        if (!prevStateChanged && !this.newEffect) {
            return false;
        }
        let stateChanged = false;
        this.newEffect = false;
        // Check each effect's condition and find new targets
        stateChanged = this.effects.reduce((stateChanged, effect) => effect.checkCondition(stateChanged), stateChanged);
        if (loops === 10) {
            throw new Error('EffectEngine.checkEffects looped 10 times');
        } else {
            this.checkEffects(stateChanged, loops + 1);
        }
        return stateChanged;
    }

    onConflictFinished() {
        this.newEffect = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfConflict);
    }

    onDuelFinished() {
        this.newEffect = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfDuel);
    }

    onPhaseEnded() {
        this.newEffect = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfPhase);
    }

    onRoundEnded() {
        this.newEffect = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilEndOfRound);
    }

    onPassActionPhasePriority(event) {
        for (const effect of this.effects) {
            if (
                effect.duration === Duration.UntilSelfPassPriority &&
                event.player === (effect as any).targetController
            ) {
                effect.duration = Duration.UntilPassPriority;
            }
        }

        this.newEffect = this.unapplyAndRemove((effect) => effect.duration === Duration.UntilPassPriority);
        for (const effect of this.effects) {
            if (
                effect.duration === Duration.UntilOpponentPassPriority ||
                effect.duration === Duration.UntilSelfPassPriority
            ) {
                effect.duration = Duration.UntilPassPriority;
            } else if (effect.duration === Duration.UntilNextPassPriority) {
                effect.duration = Duration.UntilOpponentPassPriority;
            }
        }
    }

    registerCustomDurationEvents(effect: Effect) {
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

    unregisterCustomDurationEvents(effect: Effect) {
        const remainingEvents = [];
        for (const event of this.customDurationEvents) {
            if (event.effect === effect) {
                this.game.removeListener(event.name, event.handler);
            } else {
                remainingEvents.push(event);
            }
        }
        this.customDurationEvents = remainingEvents;
    }

    createCustomDurationHandler(customDurationEffect) {
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

    unapplyAndRemove(match: (effect: Effect) => boolean) {
        let removedEffect = false;
        const remainingEffects = [];
        for (const effect of this.effects) {
            if (match(effect)) {
                removedEffect = true;
                effect.cancel();
                if (effect.duration === Duration.Custom) {
                    this.unregisterCustomDurationEvents(effect);
                }
            } else {
                remainingEffects.push(effect);
            }
        }
        this.effects = remainingEffects;
        return removedEffect;
    }

    getDebugInfo() {
        return this.effects.map((effect) => effect.getDebugInfo());
    }
}
