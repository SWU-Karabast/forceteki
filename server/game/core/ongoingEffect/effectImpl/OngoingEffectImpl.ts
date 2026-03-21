import type { AbilityContext } from '../../ability/AbilityContext';
import type { FormatMessage } from '../../chat/GameChat';
import type { Duration, EffectName } from '../../Constants';
import type { Game } from '../../Game';
import type { GameObject } from '../../GameObject';
import { GameObjectBase } from '../../GameObjectBase';
import { registerStateBase } from '../../GameObjectUtils';
import type { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import type { OngoingEffect } from '../OngoingEffect';

@registerStateBase()
export abstract class OngoingEffectImpl<TValue, TTarget extends GameObject> extends GameObjectBase {
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
    public abstract get valueWrapper(): OngoingEffectValueWrapperBase<TValue>;
    public abstract getValue(target?: TTarget): TValue;
    public abstract apply(effect: OngoingEffect<TTarget>, target: TTarget): void;
    public abstract unapply(effect: OngoingEffect<TTarget>, target: TTarget): void;
    public abstract recalculate(target: TTarget): boolean;

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
