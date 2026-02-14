import { EventName } from '../Constants';
import type { Player } from '../Player';
import type { CardAbility } from './CardAbility';
import type { IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import type Game from '../Game';
import type { IEventRegistration } from '../../Interfaces';
import { registerState, undoPlainMap, undoState } from '../GameObjectUtils';

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

export interface IAbilityLimitState extends IGameObjectBaseState {
    isRegistered: boolean;
}

@registerState()
export abstract class AbilityLimit extends GameObjectBase implements IAbilityLimit {
    public ability: CardAbility | null = null;

    @undoState() private accessor isRegistered: boolean = false;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    protected override afterSetState(oldState: IAbilityLimitState): void {
        if (this.isRegistered !== oldState.isRegistered) {
            if (this.isRegistered) {
                this.registerEvents();
            } else {
                this.unregisterEvents();
            }
        }
    }

    public override cleanupOnRemove(oldState: IAbilityLimitState): void {
        if (oldState.isRegistered) {
            this.unregisterEvents();
        }
    }

    public registerEvents(): void {
        this.isRegistered = true;
    }

    public unregisterEvents(): void {
        this.isRegistered = false;
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

@registerState()
export class UnlimitedAbilityLimit extends AbilityLimit {
    @undoPlainMap() private accessor useCount: Map<string, number> = new Map();

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

    @undoState() private accessor useCount: number = 0;

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

@registerState()
export class PerPlayerPerGameAbilityLimit extends AbilityLimit {
    public readonly max: number;

    @undoPlainMap() private accessor useCount: Map<string, number> = new Map();

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

@registerState()
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

@registerState()
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
