import type { AbilityContext } from '../../ability/AbilityContext';
import type { Duration, EffectName } from '../../Constants';
import type Game from '../../Game';

export abstract class OngoingEffectImpl<TValue> {
    public duration?: Duration = null;
    public isConditional = false;
    protected context?: AbilityContext = null;
    public readonly type: EffectName;
    protected readonly game: Game;

    public constructor(game: Game, type: EffectName) {
        this.game = game;
        this.type = type;
    }

    // TODO: add type union in constants.ts for ability targets (player or card, anything else?)
    public abstract getValue(target?): TValue;
    public abstract apply(effect, target): void;
    public abstract unapply(effect, target): void;
    public abstract recalculate(target): boolean;

    public setContext(context: AbilityContext): void {
        this.context = context;
    }

    public getDebugInfo() {
        return {
            type: this.type
        };
    }
}
