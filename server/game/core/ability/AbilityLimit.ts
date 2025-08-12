import { EventName } from '../Constants';
import type { Player } from '../Player';
import type { CardAbility } from './CardAbility';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import type Game from '../Game';
import type { IEventRegistration } from '../../Interfaces';

export interface IAbilityLimit {
    get ability(): CardAbility;
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

export interface IAbilityLimitState extends IGameObjectBaseState {
    ability: GameObjectRef<CardAbility> | undefined;
    isRegistered: boolean;
}

export abstract class AbilityLimit<TState extends IAbilityLimitState = IAbilityLimitState> extends GameObjectBase<TState> implements IAbilityLimit {
    public get ability() {
        return this.game.getFromRef(this.state.ability);
    }

    public set ability(value) {
        this.state.ability = value.getRef();
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }


    protected override setupDefaultState(): void {
        super.setupDefaultState();

        this.state.isRegistered = false;
    }

    protected override afterSetState(oldState: TState): void {
        if (this.state.isRegistered !== oldState.isRegistered) {
            if (this.state.isRegistered) {
                this.registerEvents();
            } else {
                this.unregisterEvents();
            }
        }
    }

    public override cleanupOnRemove(oldState: TState): void {
        if (oldState.isRegistered) {
            this.unregisterEvents();
        }
    }

    public registerEvents(): void {
        this.state.isRegistered = true;
    }

    public unregisterEvents(): void {
        this.state.isRegistered = false;
    }

    public isEpicActionLimit(): this is EpicActionLimit {
        return false;
    }

    public abstract clone(): AbilityLimit;
    public abstract isRepeatable(): boolean;
    public abstract isAtMax(player: Player): boolean;
    public abstract increment(player: Player): void;
    public abstract reset(): void;
}

interface IPerPlayerAbilityLimitState extends IAbilityLimitState {
    useCount: Map<string, number>;
}

interface IPerGameAbilityLimitState extends IAbilityLimitState {
    useCount: 0;
}

export class UnlimitedAbilityLimit extends AbilityLimit<IPerPlayerAbilityLimitState> {
    protected override setupDefaultState(): void {
        super.setupDefaultState();

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

    public currentForPlayer(player: Player) {
        return this.state.useCount.get(this.getKey(player.name)) ?? 0;
    }

    private getKey(player: string): string {
        return player;
    }
}

export class PerGameAbilityLimit extends AbilityLimit<IPerGameAbilityLimitState> {
    public currentUser: null | string = null;
    public readonly max: number;

    public constructor(game: Game, max: number) {
        super(game);
        this.max = max;
    }

    protected override setupDefaultState(): void {
        super.setupDefaultState();

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

    public currentForPlayer(): number {
        return this.state.useCount;
    }
}

export class PerPlayerPerGameAbilityLimit extends AbilityLimit<IPerPlayerAbilityLimitState> {
    public readonly max: number;

    public constructor(game: Game, max: number) {
        super(game);
        this.max = max;
    }

    protected override setupDefaultState(): void {
        super.setupDefaultState();

        this.state.useCount = new Map();
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
        this.state.useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.state.useCount.clear();
    }

    public currentForPlayer(player: Player) {
        return this.state.useCount.get(this.getKey(player.name)) ?? 0;
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
    private eventRegistrations?: IEventRegistration[];

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

    public override registerEvents(): void {
        super.registerEvents();

        if (this.eventRegistrations) {
            return;
        }

        this.eventRegistrations = [...this.eventName].map((eventName) => ({
            name: eventName,
            handler: () => this.reset()
        }));

        for (const event of this.eventRegistrations) {
            this.game.on(event.name, event.handler);
        }
    }

    public override unregisterEvents(): void {
        super.unregisterEvents();

        if (!this.eventRegistrations) {
            return;
        }

        for (const event of this.eventRegistrations) {
            this.game.removeListener(event.name, event.handler);
        }
        this.eventRegistrations = null;
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