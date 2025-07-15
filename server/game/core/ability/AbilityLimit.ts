import type EventEmitter from 'events';
import { EventName } from '../Constants';
import type { Player } from '../Player';
import type { CardAbility } from './CardAbility';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import type Game from '../Game';

export interface IAbilityLimit {
    get ability(): CardAbility;
    set ability(value: CardAbility);
    clone(): IAbilityLimit;
    isRepeatable(): boolean;
    isAtMax(player: Player): boolean;
    increment(player: Player): void;
    reset(): void;
    registerEvents(eventEmitter: EventEmitter): void;
    unregisterEvents(eventEmitter: EventEmitter): void;
    isEpicActionLimit(): this is EpicActionLimit;
}

interface IAbilityLimitState extends IGameObjectBaseState {
    ability: GameObjectRef<CardAbility> | undefined;
}

interface IPerPlayerAbilityLimitState extends IAbilityLimitState {
    useCount: Map<string, number>;
}

interface IPerGameAbilityLimitState extends IAbilityLimitState {
    useCount: 0;
}

export class UnlimitedAbilityLimit extends GameObjectBase<IPerPlayerAbilityLimitState> implements IAbilityLimit {
    public get ability() {
        return this.game.getFromRef(this.state.ability);
    }

    public set ability(value) {
        this.state.ability = value.getRef();
    }

    protected override setupDefaultState(): void {
        this.state.useCount = new Map();
    }

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
        this.state.useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.state.useCount.clear();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public registerEvents(eventEmitter: EventEmitter): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(player: Player) {
        return this.state.useCount.get(this.getKey(player.name)) ?? 0;
    }

    public isEpicActionLimit(): this is EpicActionLimit {
        return false;
    }

    private getKey(player: string): string {
        return player;
    }
}

export class PerGameAbilityLimit extends GameObjectBase<IPerGameAbilityLimitState> implements IAbilityLimit {
    public currentUser: null | string = null;
    public readonly max: number;

    public get ability() {
        return this.game.getFromRef(this.state.ability);
    }

    public set ability(value) {
        this.state.ability = value.getRef();
    }

    public constructor(game: Game, max: number) {
        super(game);
        this.max = max;
    }

    protected override setupDefaultState(): void {
        this.state.useCount = 0;
    }

    public clone() {
        return new PerGameAbilityLimit(this.game, this.max);
    }

    public isRepeatable(): boolean {
        return false;
    }

    public isAtMax(player: Player): boolean {
        return this.state.useCount >= this.max;
    }

    public increment(player: Player): void {
        this.state.useCount++;
    }

    public reset(): void {
        this.state.useCount = 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public registerEvents(eventEmitter: EventEmitter): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(): number {
        return this.state.useCount;
    }

    public isEpicActionLimit(): this is EpicActionLimit {
        return false;
    }
}


export class PerPlayerPerGameAbilityLimit extends GameObjectBase<IPerPlayerAbilityLimitState> implements IAbilityLimit {
    private useCount = new Map<string, number>();
    public readonly max: number;

    public get ability() {
        return this.game.getFromRef(this.state.ability);
    }

    public set ability(value) {
        this.state.ability = value.getRef();
    }

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public registerEvents(eventEmitter: EventEmitter): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(player: Player) {
        return this.useCount.get(this.getKey(player.name)) ?? 0;
    }

    public isEpicActionLimit(): this is EpicActionLimit {
        return false;
    }

    private getKey(player: string): string {
        return player;
    }

    private getModifiedMax(player: Player): number {
        const ability = this.ability;
        return ability ? ability.card.getModifiedAbilityLimitMax(player, ability, this.max) : this.max;
    }
}

export class RepeatableAbilityLimit extends PerPlayerPerGameAbilityLimit {
    private readonly eventName: Set<EventName>;

    public constructor(
        game: Game,
        max: number,
        eventName: Set<EventName>
    ) {
        super(game, max);
        this.eventName = eventName;
    }

    public override clone() {
        return new RepeatableAbilityLimit(this.game, this.max, this.eventName);
    }

    public override isRepeatable(): boolean {
        return true;
    }

    public override registerEvents(eventEmitter: EventEmitter): void {
        for (const eventN of this.eventName) {
            eventEmitter.on(eventN, () => this.reset());
        }
    }

    public override unregisterEvents(eventEmitter: EventEmitter): void {
        for (const eventN of this.eventName) {
            eventEmitter.removeListener(eventN, () => this.reset());
        }
    }
}

export class EpicActionLimit extends PerPlayerPerGameAbilityLimit {
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

export class AbilityLimitInstance {
    private readonly game: Game;
    public constructor(game: Game) {
        this.game = game;
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
}