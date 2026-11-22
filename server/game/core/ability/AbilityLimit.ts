import { EventName } from '../Constants';
import type { Player } from '../Player';
import type { CardAbility } from './CardAbility';
import type { IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import type { Game } from '../Game';
import type { IEventRegistration } from '../../Interfaces';
import { registerState, registerStateBase, stateValue, statePrimitive } from '../GameObjectUtils';
import type { AbilityContext } from './AbilityContext';
import { Contract } from '../utils/Contract';

export interface IAbilityLimit {
    get ability(): CardAbility | null;
    set ability(value: CardAbility);
    clone(): AbilityLimit;
    isRepeatable(): boolean;
    isAtMax(player: Player): boolean;
    increment(player: Player): void;
    reset(): void;
    registerEvents(): void;
    unregisterEvents(): void;
    isEpicActionLimit(): this is EpicActionLimit;
}

export interface ILimitState extends IGameObjectBaseState {
    isRegistered: boolean;
}

/**
 * Shared plumbing for limits: tracks whether the limit is registered and, for limits that reset on
 * game events (e.g. the end of each phase), owns the listeners that call {@link reset}.
 */
@registerStateBase()
export abstract class ResettingLimitBase extends GameObjectBase {
    private eventRegistrations?: IEventRegistration[];

    @statePrimitive() private accessor isRegistered = false;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    /** Events that reset this limit while it is registered. None by default. */
    protected get resetEventNames(): ReadonlySet<EventName> {
        return new Set();
    }

    protected override afterSetState(oldState: ILimitState): void {
        if (this.isRegistered !== oldState.isRegistered) {
            if (this.isRegistered) {
                this.registerEvents();
            } else {
                this.unregisterEvents();
            }
        }
    }

    public override cleanupOnRemove(oldState: ILimitState): void {
        if (oldState.isRegistered) {
            this.unregisterEvents();
        }
    }

    public registerEvents(): void {
        this.isRegistered = true;

        if (this.eventRegistrations || this.resetEventNames.size === 0) {
            return;
        }

        this.eventRegistrations = [...this.resetEventNames].map((eventName) => ({
            name: eventName,
            handler: () => this.reset()
        }));

        for (const event of this.eventRegistrations) {
            this.game.on(event.name, event.handler);
        }
    }

    public unregisterEvents(): void {
        this.isRegistered = false;

        if (!this.eventRegistrations) {
            return;
        }

        for (const event of this.eventRegistrations) {
            this.game.removeListener(event.name, event.handler);
        }
        this.eventRegistrations = null;
    }

    public abstract reset(): void;
}

@registerStateBase()
export abstract class AbilityLimit extends ResettingLimitBase implements IAbilityLimit {
    public ability: CardAbility | null = null;

    public isEpicActionLimit(): this is EpicActionLimit {
        return false;
    }

    public abstract clone(): AbilityLimit;
    public abstract isRepeatable(): boolean;
    public abstract isAtMax(player: Player): boolean;
    public abstract increment(player: Player): void;
}

@registerState()
export class UnlimitedAbilityLimit extends AbilityLimit {
    @stateValue() private accessor useCount = new Map<string, number>();

    public clone() {
        return new UnlimitedAbilityLimit(this.game);
    }

    public isRepeatable(): boolean {
        return true;
    }

    public isAtMax(player: Player): boolean {
        return false;
    }

    public increment(player: Player): void {
        const key = this.getKey(player.name);
        this.useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.useCount.clear();
    }

    public currentForPlayer(player: Player) {
        return this.useCount.get(this.getKey(player.name)) ?? 0;
    }

    private getKey(player: string): string {
        return player;
    }
}

@registerState()
export class PerGameAbilityLimit extends AbilityLimit {
    public currentUser: null | string = null;
    public readonly max: number;

    @statePrimitive() private accessor useCount = 0;

    public constructor(game: Game, max: number) {
        super(game);
        this.max = max;
    }

    public clone() {
        return new PerGameAbilityLimit(this.game, this.max);
    }

    public isRepeatable(): boolean {
        return false;
    }

    public isAtMax(player: Player): boolean {
        return this.useCount >= this.max;
    }

    public increment(player: Player): void {
        this.useCount++;
    }

    public reset(): void {
        this.useCount = 0;
    }

    public currentForPlayer(): number {
        return this.useCount;
    }
}

@registerStateBase()
export abstract class PerPlayerPerGameAbilityLimitBase extends AbilityLimit {
    public readonly max: number;

    @stateValue() private accessor useCount = new Map<string, number>();

    public constructor(game: Game, max: number) {
        super(game);
        this.max = max;
    }

    public clone() {
        return new PerPlayerPerGameAbilityLimit(this.game, this.max);
    }

    public isRepeatable(): boolean {
        return false;
    }

    public isAtMax(player: Player): boolean {
        return this.currentForPlayer(player) >= this.getModifiedMax(player);
    }

    public increment(player: Player): void {
        const key = this.getKey(player.name);
        this.useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.useCount.clear();
    }

    public currentForPlayer(player: Player) {
        return this.useCount.get(this.getKey(player.name)) ?? 0;
    }

    private getKey(player: string): string {
        return player;
    }

    private getModifiedMax(player: Player): number {
        const ability = this.ability;
        return ability ? ability.card.getModifiedAbilityLimitMax(player, ability, this.max) : this.max;
    }
}

// This class intentionally adds no logic.
// @registerState classes are terminal (cannot be further extended), but we still need
// a concrete, instantiable type for PerPlayerPerGameAbilityLimitBase.
@registerState()
export class PerPlayerPerGameAbilityLimit extends PerPlayerPerGameAbilityLimitBase { }

@registerState()
export class RepeatableAbilityLimit extends PerPlayerPerGameAbilityLimitBase {
    private readonly eventName: Set<EventName>;

    public constructor(
        game: Game,
        max: number,
        eventName: Set<EventName>
    ) {
        super(game, max);
        this.eventName = eventName;
    }

    protected override get resetEventNames(): ReadonlySet<EventName> {
        return this.eventName;
    }

    public override clone() {
        return new RepeatableAbilityLimit(this.game, this.max, this.eventName);
    }

    public override isRepeatable(): boolean {
        return true;
    }
}

@registerState()
export class EpicActionLimit extends PerPlayerPerGameAbilityLimitBase {
    public constructor(game: Game) {
        super(game, 1);
    }

    public override clone() {
        return new EpicActionLimit(this.game);
    }

    public override isEpicActionLimit(): this is EpicActionLimit {
        return true;
    }

    // this prevents the limit from being reset when a leader is defeated
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override reset() {}
}

/**
 * Records how many times each option of a choice has been chosen during the current period (e.g. this phase), for
 * every card in the game. Created once per period when the game is set up and shared through {@link PerChoiceLimit}
 * handles, so no limit objects are created while abilities are being evaluated.
 *
 * Uses are counted per card identity and per ability step rather than per player: a card that leaves play and
 * returns is a new object with no choice history (`SWU 8.5.4`), a card that changes control keeps its history, and
 * each card that gains the same ability gets its own counts.
 */
@registerState()
export class ChoiceLimitTracker extends ResettingLimitBase {
    private readonly resetEvents: Set<EventName>;

    @stateValue() private accessor useCount = new Map<string, number>();

    /**
     * Number of options each limited choice had when first evaluated, by card identity and ability step. Not game
     * state: it only depends on the card implementation, and is used to check that option ids are stable.
     */
    private readonly choiceCounts = new Map<string, number>();

    public constructor(game: Game, resetEvents: Set<EventName>) {
        super(game);
        this.resetEvents = resetEvents;
    }

    protected override onInitialize(): void {
        super.onInitialize();
        this.registerEvents();
    }

    protected override get resetEventNames(): ReadonlySet<EventName> {
        return this.resetEvents;
    }

    public currentForChoice(context: AbilityContext, choiceId: string): number {
        return this.useCount.get(this.getChoiceKey(context, choiceId)) ?? 0;
    }

    public increment(context: AbilityContext, choiceId: string): void {
        this.useCount.set(this.getChoiceKey(context, choiceId), this.currentForChoice(context, choiceId) + 1);
    }

    public reset(): void {
        this.useCount.clear();
    }

    /**
     * Options are identified by position, so a limited choice must always offer the same number of options. This also
     * catches two limited choices with different numbers of options that resolve to the same ability step.
     */
    public assertStableChoiceCount(context: AbilityContext, labels: string[]): void {
        const key = this.getScopeKey(context);
        const expectedCount = this.choiceCounts.get(key);

        if (expectedCount == null) {
            this.choiceCounts.set(key, labels.length);
            return;
        }

        Contract.assertTrue(
            labels.length === expectedCount,
            `Options with a choice limit are identified by position, so their number must not change between evaluations (${key}: expected ${expectedCount}, got ${labels.length}: ${labels.join(', ')})`
        );
    }

    private getChoiceKey(context: AbilityContext, choiceId: string): string {
        return `${this.getScopeKey(context)}|${choiceId}`;
    }

    private getScopeKey(context: AbilityContext): string {
        Contract.assertTrue(context.ability?.isCardAbilityStep(), 'A choice limit can only be used by a card ability');
        return `${context.ability.stepIdentifier}|${context.source.uuid}:${context.source.identityId}`;
    }
}

/**
 * Limits how many times each option of a choice can be chosen, across every resolution of the ability that offers it
 * (e.g. "Choose one that hasn't been chosen this phase"). The counts live in a game-wide {@link ChoiceLimitTracker},
 * so this handle can be created anywhere, including inside property factories.
 */
export class PerChoiceLimit {
    public readonly max: number;
    private readonly tracker: ChoiceLimitTracker;

    public constructor(tracker: ChoiceLimitTracker, max: number) {
        this.tracker = tracker;
        this.max = max;
    }

    public isAtMax(context: AbilityContext, choiceId: string): boolean {
        return this.tracker.currentForChoice(context, choiceId) >= this.max;
    }

    public increment(context: AbilityContext, choiceId: string): void {
        this.tracker.increment(context, choiceId);
    }

    public assertStableChoiceCount(context: AbilityContext, labels: string[]): void {
        this.tracker.assertStableChoiceCount(context, labels);
    }
}

export class AbilityLimitInstance {
    private readonly game: Game;
    private readonly choicesThisPhase: ChoiceLimitTracker;
    private readonly choicesThisRound: ChoiceLimitTracker;

    public constructor(game: Game) {
        this.game = game;
        this.choicesThisPhase = new ChoiceLimitTracker(game, new Set([EventName.OnPhaseEnded]));
        this.choicesThisRound = new ChoiceLimitTracker(game, new Set([EventName.OnRoundEnded]));
    }

    public repeatable(max: number, eventName: EventName) {
        return new RepeatableAbilityLimit(this.game, max, new Set([eventName]));
    }

    public perPhase(max: number) {
        return new RepeatableAbilityLimit(this.game, max, new Set([EventName.OnPhaseEnded]));
    }

    public perRound(max: number) {
        return new RepeatableAbilityLimit(this.game, max, new Set([EventName.OnRoundEnded]));
    }

    /**
     * A per-game ability limit that is tracked regardless of player.
     *
     * Use this ability for card effects whose limit applies to a card,
     * rather than to a player.
     *
     * @param max The maximum number of times this ability can be used in a game.
     */
    public perGame(max: number) {
        return new PerGameAbilityLimit(this.game, max);
    }

    public perPlayerPerGame(max: number) {
        return new PerPlayerPerGameAbilityLimit(this.game, max);
    }

    public epicAction() {
        return new EpicActionLimit(this.game);
    }

    public unlimited() {
        return new UnlimitedAbilityLimit(this.game);
    }

    /** Each option of a choice can be chosen at most `max` times each phase. See {@link PerChoiceLimit}. */
    public perChoicePerPhase(max: number) {
        return new PerChoiceLimit(this.choicesThisPhase, max);
    }

    /** Each option of a choice can be chosen at most `max` times each round. See {@link PerChoiceLimit}. */
    public perChoicePerRound(max: number) {
        return new PerChoiceLimit(this.choicesThisRound, max);
    }
}
