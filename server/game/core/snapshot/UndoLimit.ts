
export abstract class UndoLimit {
    public abstract hasReachedLimit(playerId: string): boolean;
    public abstract incrementUses(playerId: string): void;
    public abstract reset(): void;

    public isPerGameLimit(): this is PerGameUndoLimit {
        return false;
    }
}

export class UnlimitedUndoLimit extends UndoLimit {
    public hasReachedLimit(_playerId: string): boolean {
        return false;
    }

    public incrementUses(_playerId: string): void {
        // No-op
    }

    public reset(): void {
        // No-op
    }
}

export class PerGameUndoLimit extends UndoLimit {
    public readonly max: number;
    private useCountPerPlayer = new Map<string, number>();

    public constructor(max: number) {
        super();
        this.max = max;
    }

    public hasReachedLimit(playerId: string): boolean {
        const useCount = this.useCountPerPlayer.get(playerId) ?? 0;
        return useCount >= this.max;
    }

    public incrementUses(playerId: string): void {
        const useCount = this.useCountPerPlayer.get(playerId) ?? 0;
        this.useCountPerPlayer.set(playerId, useCount + 1);
    }

    public reset(): void {
        this.useCountPerPlayer.clear();
    }

    public override isPerGameLimit(): this is PerGameUndoLimit {
        return true;
    }
}