import { Duration, EffectName, EventName } from '../Constants';
import type { GameEvent } from '../event/GameEvent';
import type { OngoingEffect } from './OngoingEffect';
import type { OngoingEffectSource } from './OngoingEffectSource';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import { DelayedEffectType } from '../../gameSystems/DelayedEffectSystem';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, undoArray } from '../GameObjectUtils';

interface ICustomDurationEventState extends IGameObjectBaseState {
    isRegistered: boolean;
}

class CustomDurationEvent extends GameObjectBase<ICustomDurationEventState> {
    public readonly name: string;
    public readonly handler: (...args: any[]) => void;
    public readonly effect: OngoingEffect<any>;

    public constructor(game: Game, name: string, handler: (...args: any[]) => void, effect: OngoingEffect<any>) {
        super(game);
        this.name = name;
        this.handler = handler;
        this.effect = effect;
    }

    protected override setupDefaultState(): void {
        this.state.isRegistered = false;
    }

    public registerEvent(): void {
        this.state.isRegistered = true;
        this.game.on(this.name, this.handler);
    }

    public unregisterEvent(): void {
        this.state.isRegistered = false;
        this.game.removeListener(this.name, this.handler);
    }

    protected override afterSetState(oldState: ICustomDurationEventState): void {
        if (this.state.isRegistered !== oldState.isRegistered) {
            if (this.state.isRegistered) {
                this.registerEvent();
            } else {
                this.unregisterEvent();
            }
        }
    }

    public override cleanupOnRemove(oldState: ICustomDurationEventState): void {
        if (oldState.isRegistered) {
            this.unregisterEvent();
        }
    }
}

export interface IOngoingEffectState extends IGameObjectBaseState {
    effects: GameObjectRef<OngoingEffect<any>>[]; // TODO: Can we make OngoingEffect have an ID w/o using GameObjectBase? Probably, do it similiar to how snapshot IDs work.
}

@registerState()
export class OngoingEffectEngine extends GameObjectBase<IOngoingEffectState> {
    public events: EventRegistrar;
    public effectsChangedSinceLastCheck = false;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    @undoArray()
    public accessor effects: readonly OngoingEffect[] = [];

    @undoArray()
    public accessor customDurationEvents: readonly CustomDurationEvent[] = [];

    public constructor(game: Game) {
        super(game);
        this.events = new EventRegistrar(game, this);
        this.events.register([
            EventName.OnAttackCompleted,
            EventName.OnPhaseEnded,
            EventName.OnRoundEnded
        ]);
    }

    public add(effect: OngoingEffect<any>) {
        this.effects = [...this.effects, effect];
        if (effect.duration === Duration.Custom) {
            this.registerCustomDurationEvents(effect);
        }
        this.effectsChangedSinceLastCheck = true;
        return effect;
    }

    public checkDelayedEffects(events: GameEvent[]) {
        const effectsToTrigger: OngoingEffect<any>[] = [];
        const effectsToRemove: OngoingEffect<any>[] = [];

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
            const context = effect.context.createCopy({ events });
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
                    properties.limit.increment(context.player);
                    this.game.queueSimpleStep(() => this.game.openEventWindow(actionEvents), 'openDelayedActionsWindow');
                    this.game.queueSimpleStep(() => this.game.resolveGameState(true), 'resolveGameState');
                }
            };
        });

        if (effectTriggers.length > 0) {
            // TODO Implement the correct trigger window. We may need a subclass of TriggeredAbilityWindow for multiple simultaneous effects
            effectTriggers.forEach((trigger) => {
                try {
                    trigger.handler();
                } catch (err) {
                    this.game.reportError(err);
                }
            });
        }

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

        if (effectsToRemove.length > 0) {
            this.unapplyAndRemove((effect) => effectsToRemove.includes(effect));
        }
    }

    public removeLastingEffects(card: OngoingEffectSource) {
        Contract.assertTrue(card.isCard());

        this.unapplyAndRemove(
            (effect) => {
                if (effect.impl.type === 'delayedEffect') {
                    if (
                        Helpers.asArray(effect.targets).includes(card) &&
                        effect.duration !== Duration.WhileSourceInPlay &&
                        effect.ongoingEffect.delayedEffectType !== DelayedEffectType.Player
                    ) {
                        return true;
                    }

                    const effectImplValue = effect.impl.getValue();
                    const limit = effectImplValue.limit;

                    return limit.isAtMax(effect.context.player);
                }

                if (effect.duration !== Duration.Persistent && effect.duration !== Duration.Custom) {
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
        this.effectsChangedSinceLastCheck = false;

        let stateChanged = this.checkWhileSourceInPlayEffectExpirations();

        // Check each effect's condition and find new targets
        stateChanged = this.effects.reduce((stateChanged, effect) => effect.resolveEffectTargets() || stateChanged, stateChanged);
        if (loops === 10) {
            throw new Error('OngoingEffectEngine.resolveEffects looped 10 times');
        } else {
            this.resolveEffects(stateChanged, loops + 1);
        }
        return stateChanged;
    }

    private checkWhileSourceInPlayEffectExpirations() {
        return this.unapplyAndRemove((effect) => {
            if (effect.duration === Duration.WhileSourceInPlay) {
                Contract.assertTrue(effect.source.canBeInPlay(), `${effect.source.internalName} is not a legal target for an effect with duration '${Duration.WhileSourceInPlay}'`);

                if (!effect.source.isInPlay()) {
                    return true;
                }
            }

            return false;
        });
    }

    private unapplyEffect(effect: OngoingEffect<any>) {
        effect.cancel();
        if (effect.duration === Duration.Custom) {
            this.unregisterCustomDurationEvents(effect);
        }
    }

    public unapplyAndRemove(match: (effect: OngoingEffect<any>) => boolean) {
        let anyEffectRemoved = false;
        const remainingEffects: OngoingEffect<any>[] = [];
        for (const effect of this.effects) {
            if (match(effect)) {
                anyEffectRemoved = true;
                this.unapplyEffect(effect);
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

    private registerCustomDurationEvents(effect: OngoingEffect<any>) {
        if (!effect.until) {
            return;
        }

        const handler = this.createCustomDurationHandler(effect);

        const newEvents: CustomDurationEvent[] = [];
        for (const eventName of Object.keys(effect.until)) {
            const newEvent = new CustomDurationEvent(this.game, eventName, handler, effect);
            newEvent.registerEvent();
            newEvents.push(newEvent);
        }

        this.customDurationEvents = [...this.customDurationEvents, ...newEvents];
    }

    private unregisterCustomDurationEvents(effect: OngoingEffect<any>) {
        const remainingEvents: CustomDurationEvent[] = [];

        for (const event of this.customDurationEvents) {
            if (event.effect === effect) {
                event.unregisterEvent();
            } else {
                remainingEvents.push(event);
            }
        }

        this.customDurationEvents = remainingEvents;
    }

    private createCustomDurationHandler(customDurationEffect: OngoingEffect<any>) {
        return (...args) => {
            const event = args[0];
            const listener = customDurationEffect.until[event.name];
            if (listener && listener(event, customDurationEffect.context)) {
                customDurationEffect.cancel();
                this.unregisterCustomDurationEvents(customDurationEffect);
                this.effects = this.effects.filter((effect) => effect !== customDurationEffect);
            }
        };
    }

    public getDebugInfo() {
        return this.effects.map((effect) => effect.getDebugInfo());
    }

    public override afterSetAllState(_prevState: IOngoingEffectState) {
        // resolve effects so that targets are recalculated
        this.resolveEffects(true);
    }
}
