import type { AbilityContext } from '../../ability/AbilityContext';
import type { FormatMessage } from '../../chat/GameChat';
import type { Duration, EffectName } from '../../Constants';
import type Game from '../../Game';
import { GameObjectBase } from '../../GameObjectBase';
import { registerState } from '../../GameObjectUtils';

@registerState()
export abstract class OngoingEffectImpl<TValue> extends GameObjectBase {
    public duration?: Duration = null;
    public isConditional = false;
    protected context?: AbilityContext = null;
    public readonly type: EffectName;

    public constructor(game: Game, type: EffectName) {
        super(game);
        this.type = type;
    }

    public get effectDescription(): FormatMessage | undefined {
        return undefined;
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

    public override getGameObjectName() {
        return 'OngoingEffectImpl';
    }
}
