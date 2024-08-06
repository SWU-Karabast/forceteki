import EventEmitter from 'events';
import { EventNames } from './Constants';
import Player from './player';
import type CardAbility from './CardAbility';

export interface AbilityLimit {
    ability?: CardAbility;
    currentUser: null | string;
    clone(): AbilityLimit;
    isRepeatable(): boolean;
    isAtMax(player: Player): boolean;
    increment(player: Player): void;
    reset(): void;
    registerEvents(eventEmitter: EventEmitter): void;
    unregisterEvents(eventEmitter: EventEmitter): void;
}

class UnlimitedAbilityLimit {
    public ability?: CardAbility;
    public currentUser: null | string = null;
    #useCount = new Map<string, number>();

    constructor() {}

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
        const key = this.#getKey(player.name);
        this.#useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.#useCount.clear();
    }

    public registerEvents(eventEmitter: EventEmitter): void {}

    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(player: Player) {
        return this.#useCount.get(this.#getKey(player.name)) ?? 0;
    }

    #getKey(player: string): string {
        if (this.currentUser) {
            return player + this.currentUser;
        }
        return player;
    }
}

class FixedAbilityLimit {
    public ability?: CardAbility;
    public currentUser: null | string = null;
    #useCount = new Map<string, number>();

    constructor(public max: number) {}

    public clone() {
        return new FixedAbilityLimit(this.max);
    }

    public isRepeatable(): boolean {
        return false;
    }

    public isAtMax(player: Player): boolean {
        return this.currentForPlayer(player) >= this.#getModifiedMax(player);
    }

    public increment(player: Player): void {
        const key = this.#getKey(player.name);
        this.#useCount.set(key, this.currentForPlayer(player) + 1);
    }

    public reset(): void {
        this.#useCount.clear();
    }

    public registerEvents(eventEmitter: EventEmitter): void {}

    public unregisterEvents(eventEmitter: EventEmitter): void {}

    public currentForPlayer(player: Player) {
        return this.#useCount.get(this.#getKey(player.name)) ?? 0;
    }

    #getKey(player: string): string {
        if (this.currentUser) {
            return player + this.currentUser;
        }
        return player;
    }

    #getModifiedMax(player: Player): number {
        return this.ability ? this.ability.card.getModifiedLimitMax(player, this.ability, this.max) : this.max;
    }
}

class RepeatableAbilityLimit extends FixedAbilityLimit {
    constructor(
        max: number,
        private eventName: Set<EventNames>
    ) {
        super(max);
    }

    public clone() {
        return new RepeatableAbilityLimit(this.max, this.eventName);
    }

    public isRepeatable(): boolean {
        return true;
    }

    public registerEvents(eventEmitter: EventEmitter): void {
        for (const eventN of this.eventName) {
            eventEmitter.on(eventN, () => this.reset());
        }
    }

    public unregisterEvents(eventEmitter: EventEmitter): void {
        for (const eventN of this.eventName) {
            eventEmitter.removeListener(eventN, () => this.reset());
        }
    }
}

export function fixed(max: number) {
    return new FixedAbilityLimit(max);
}

export function repeatable(max: number, eventName: EventNames) {
    return new RepeatableAbilityLimit(max, new Set([eventName]));
}

export function perConflict(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventNames.OnConflictFinished]));
}

export function perConflictOpportunity(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventNames.OnConflictFinished, EventNames.OnConflictPass]));
}

export function perPhase(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventNames.OnPhaseEnded]));
}

export function perRound(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventNames.OnRoundEnded]));
}

export function perGame(max: number) {
    return new RepeatableAbilityLimit(max, new Set());
}

export function perDuel(max: number) {
    return new RepeatableAbilityLimit(max, new Set([EventNames.OnDuelFinished]));
}

export function unlimitedPerConflict() {
    return new RepeatableAbilityLimit(Infinity, new Set([EventNames.OnConflictFinished]));
}

export function unlimited() {
    return new UnlimitedAbilityLimit();
}
