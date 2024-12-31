import type EventEmitter from 'events';
import { EventName } from '../Constants';
import type Player from '../Player';
import type { CardAbility } from './CardAbility';

export interface IAbilityLimit {
    ability?: CardAbility;
    currentUser: null | string;
    clone(): IAbilityLimit;
    isRepeatable(): boolean;
    isAtMax(player: Player): boolean;
    increment(player: Player): void;
    reset(): void;
    registerEvents(eventEmitter: EventEmitter): void;
    unregisterEvents(eventEmitter: EventEmitter): void;
}

class UnlimitedAbilityLimit implements IAbilityLimit {
    public ability?: CardAbility;
    public currentUser: null | string = null;
    private useCount = new Map<string, number>();

    public clone() {
        return new UnlimitedAbilityLimit();
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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public registerEvents(eventEmitter: EventEmitter): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(player: Player) {
        return this.useCount.get(this.getKey(player.name)) ?? 0;
    }

    private getKey(player: string): string {
        if (this.currentUser) {
            return player + this.currentUser;
        }
        return player;
    }
}

class PerGameAbilityLimit implements IAbilityLimit {
    public ability?: CardAbility;
    public currentUser: null | string = null;
    private useCount = new Map<string, number>();

    public constructor(public max: number) {}

    public clone() {
        return new PerGameAbilityLimit(this.max);
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

    private getKey(player: string): string {
        if (this.currentUser) {
            return player + this.currentUser;
        }
        return player;
    }

    private getModifiedMax(player: Player): number {
        return this.ability ? this.ability.card.getModifiedAbilityLimitMax(player, this.ability, this.max) : this.max;
    }
}

class RepeatableAbilityLimit extends PerGameAbilityLimit {
    public constructor(
        max: number,
        private eventName: Set<EventName>
    ) {
        super(max);
    }

    public override clone() {
        return new RepeatableAbilityLimit(this.max, this.eventName);
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

class EpicActionLimit extends PerGameAbilityLimit {
    public constructor() {
        super(1);
    }

    public override clone() {
        return new EpicActionLimit();
    }

    // this prevents the limit from being reset when a leader is defeated
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override reset() {}
}

export function repeatable(max: number, eventName: EventName) {
    return new RepeatableAbilityLimit(max, new Set([eventName]));
}

export function perPhase(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventName.OnPhaseEnded]));
}

export function perRound(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventName.OnRoundEnded]));
}

export function perGame(max: number) {
    return new PerGameAbilityLimit(max);
}

export function epicAction() {
    return new EpicActionLimit();
}

export function unlimited() {
    return new UnlimitedAbilityLimit();
}
