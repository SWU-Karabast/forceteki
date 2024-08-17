import { Duration, EffectName, EventName } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type OngoingEffect from './OngoingEffect';
import type OngoingEffectSource from './OngoingEffectSource';
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
                    if (!properties.multipleTrigger && effect.duration !== Duration.Persistent) {
                        effectsToRemove.push(effect);
                    }
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
                    const actionEvents = properties.gameAction.generateEventsForAllTargets(context);
                    this.game.queueSimpleStep(() => this.game.openAdditionalAbilityStepEventWindow(actionEvents), 'openAdditionAbilityStepEventWindow');  // TODO: why is it using this window type?
                    this.game.queueSimpleStep(() => context.refill());
                }
            };
        });
        if (effectsToRemove.length > 0) {
            this.unapplyAndRemove((effect) => effectsToRemove.includes(effect));
        }
        if (effectTriggers.length > 0) {
            this.game.openSimultaneousEffectWindow(effectTriggers);
        }
    }

    public removeLastingEffects(card: OngoingEffectSource) {
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

    public resolveEffects(prevStateChanged = false, loops = 0) {
        if (!prevStateChanged && !this.effectsChangedSinceLastCheck) {
            return false;
        }
        let stateChanged = false;
        this.effectsChangedSinceLastCheck = false;
        // Check each effect's condition and find new targets
        stateChanged = this.effects.reduce((stateChanged, effect) => effect.checkCondition(stateChanged), stateChanged);
        if (loops === 10) {
            throw new Error('OngoingEffectEngine.checkEffects looped 10 times');
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
