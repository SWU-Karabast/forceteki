import { Duration, EffectName, EventName, RelativePlayer } from '../Constants';
import type { GameEvent } from '../event/GameEvent';
import type { OngoingEffect } from './OngoingEffect';
import type { OngoingEffectSourceBase } from './OngoingEffectSource';
import { EventRegistrar } from '../event/EventRegistrar';
import type { Game } from '../Game';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import { EnumHelpers } from '../utils/EnumHelpers';
import { DelayedEffectType } from '../../gameSystems/DelayedEffectSystem';
import type { IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, stateRefArray, statePrimitive, type GameObjectId } from '../GameObjectUtils';
import type { MsgArg } from '../chat/GameChat';
import type { IOngoingEffectSummary } from '../../Interfaces';
import type { Card } from '../card/Card';

interface ICustomDurationEventState extends IGameObjectBaseState {
    isRegistered: boolean;
}

const asText = (desc: unknown): string | undefined =>
    (typeof desc === 'string' ? desc : (desc as { format?: string })?.format);

/**
 * Pulls a human-readable title from the ability that created an effect, preferring its
 * `contextTitle` over its `title` (via `getTitle`). Defensive because this runs on every
 * state serialization and a throwing `contextTitle` should never make the game unplayable.
 */
function getAbilityTitle(ability: { getTitle?: (context: unknown) => string; title?: string } | undefined, context: unknown): string | undefined {
    if (!ability) {
        return undefined;
    }
    try {
        if (typeof ability.getTitle === 'function') {
            const title = ability.getTitle(context);
            if (title) {
                return title;
            }
        }
    } catch {
        // fall through to the plain title
    }
    return typeof ability.title === 'string' ? ability.title : undefined;
}

/**
 * Constant abilities don't attach themselves to their effect's props the way lasting/delayed
 * effects do, so recover the owning ability via the source's registered constant abilities.
 */
function findRegisteringConstantAbility(effect: OngoingEffect) {
    return effect.source?.getConstantAbilities?.()
        .find((ability) => ability.registeredEffects?.includes(effect));
}

/**
 * Resolves a description for an ongoing effect. Prefers the title/contextTitle of the ability
 * that created it (the reliable, author-maintained text), falling back to any explicit
 * description set on the effect props or impl.
 */
function describeEffect(effect: OngoingEffect): string | undefined {
    const ability = effect.ongoingEffect?.ability ?? findRegisteringConstantAbility(effect);
    // These description fields originate from lasting-effect props and are spread onto the
    // ongoing effect props at runtime, but aren't part of the IOngoingEffectProps type.
    const props = effect.ongoingEffect as { ongoingEffectDescription?: unknown; effectDescription?: unknown } | undefined;
    return getAbilityTitle(ability, effect.context) ??
      asText(props?.ongoingEffectDescription) ??
      asText(props?.effectDescription) ??
      asText(effect.impl?.effectDescription);
}

/**
 * Detached effects (e.g. cost adjusters) store the applied game object, which tracks its own
 * use limit. Once every applied instance is spent, the effect is no longer doing anything and
 * shouldn't be surfaced in the summary (its lasting-effect duration may keep it alive in the
 * engine until end of phase regardless).
 */
function effectLimitReached(effect: OngoingEffect): boolean {
    const appliedValues = (effect.impl?.valueWrapper as { targetStates?: ReadonlyMap<string, unknown> })?.targetStates;
    if (!appliedValues) {
        return false;
    }
    const limited = [...appliedValues.values()].filter(
        (applied): applied is { isExpired: () => boolean } => typeof (applied as { isExpired?: unknown })?.isExpired === 'function'
    );
    return limited.length > 0 && limited.every((applied) => applied.isExpired());
}

@registerState()
class CustomDurationEvent extends GameObjectBase {
    public readonly name: string;
    public readonly handler: (...args: any[]) => void;
    public readonly effect: OngoingEffect<any>;

    @statePrimitive() private accessor isRegistered: boolean = false;

    public constructor(game: Game, name: string, handler: (...args: any[]) => void, effect: OngoingEffect<any>) {
        super(game);
        this.name = name;
        this.handler = handler;
        this.effect = effect;
    }

    public registerEvent(): void {
        this.isRegistered = true;
        this.game.on(this.name, this.handler);
    }

    public unregisterEvent(): void {
        this.isRegistered = false;
        this.game.removeListener(this.name, this.handler);
    }

    protected override afterSetState(oldState: ICustomDurationEventState): void {
        if (this.isRegistered !== oldState.isRegistered) {
            if (this.isRegistered) {
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
    effects: GameObjectId<OngoingEffect<any>>[];
}

@registerState()
export class OngoingEffectEngine extends GameObjectBase {
    public events: EventRegistrar;
    public effectsChangedSinceLastCheck = false;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    @stateRefArray()
    public accessor effects: readonly OngoingEffect[] = [];

    @stateRefArray()
    public accessor customDurationEvents: readonly CustomDurationEvent[] = [];

    public constructor(game: Game) {
        super(game);
        this.events = new EventRegistrar(game, this);
        this.events.register([
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

    // This effect type is not displayed since it gives away hidden information
    private static readonly effectTypesHiddenFromSummary = new Set<EffectName>([
        EffectName.EntersPlayReady,
    ]);

    /**
     * Returns the currently active ongoing effects in a shape the FE renders directly.
     */
    public summarizeOngoingEffectsForState(): IOngoingEffectSummary[] {
        const summaries: IOngoingEffectSummary[] = [];

        for (const effect of this.effects) {
            if (!effect.isEffectActive() || !effect.source?.isCard?.()) {
                continue;
            }
            if (OngoingEffectEngine.effectTypesHiddenFromSummary.has(effect.impl?.type)) {
                continue;
            }
            if (effectLimitReached(effect)) {
                continue;
            }

            const source = effect.source as Card;
            summaries.push({
                sourceCardUuid: source.uuid,
                source: {
                    type: source.type,
                    setId: source.setId,
                    controllerId: source.controller?.id ?? source.owner?.id,
                    sourceZone: source.zoneName,
                    sourceTitle: source.title,
                    sourceSubtitle: source.subtitle,
                    effectDescription: describeEffect(effect),
                },
                targets: effect.targets
                    .filter((effectTarget) =>
                        effectTarget?.isCard?.() &&
                        !EnumHelpers.isHiddenFromOpponent(effectTarget.zoneName, RelativePlayer.Self))
                    .map((effectTarget) => effectTarget.uuid),
            });
        }

        return summaries;
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

                    const actionEvents = [];
                    properties.immediateEffect.queueGenerateEventGameSteps(actionEvents, context);
                    properties.limit.increment(context.player);

                    if (properties.immediateEffect.hasLegalTarget(context)) {
                        const messageArgs: MsgArg[] = [context.player, ' uses a delayed effect applied by ', context.source, ' to '];
                        const [effectMessage, effectArgs] = properties.immediateEffect.getEffectMessage(context);
                        messageArgs.push({ format: effectMessage, args: effectArgs });

                        this.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
                    }

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

    public removeLastingEffects(card: OngoingEffectSourceBase) {
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
        const removedEffects: OngoingEffect<any>[] = [];

        for (const effect of this.effects) {
            if (match(effect)) {
                anyEffectRemoved = true;
                removedEffects.push(effect);
            } else {
                remainingEffects.push(effect);
            }
        }

        this.effects = remainingEffects;

        for (const removedEffect of removedEffects) {
            this.unapplyEffect(removedEffect);
        }

        return anyEffectRemoved;
    }

    public unregisterOnAttackEffects() {
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


