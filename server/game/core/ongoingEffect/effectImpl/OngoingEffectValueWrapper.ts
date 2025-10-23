import type { AbilityContext } from '../../ability/AbilityContext';
import type { FormatMessage } from '../../chat/GameChat';
import type Game from '../../Game';
import type { IGameObjectBaseState } from '../../GameObjectBase';
import { GameObjectBase } from '../../GameObjectBase';
import { registerState } from '../../GameObjectUtils';
import type { GainAbility } from './GainAbility';

@registerState()
export class OngoingEffectValueWrapper<TValue, TState extends IGameObjectBaseState = IGameObjectBaseState> extends GameObjectBase<TState> {
    private readonly value: TValue;
    public context?: AbilityContext;
    public effectDescription?: FormatMessage;

    public constructor(game: Game, value: TValue, effectDescription?: FormatMessage | string) {
        super(game);
        // @ts-expect-error
        this.value = value == null ? true : value;
        if (typeof effectDescription === 'string') {
            this.effectDescription = { format: effectDescription, args: [] };
        } else {
            this.effectDescription = effectDescription;
        }
    }

    public setContext(context: AbilityContext): void {
        this.context = context;
    }

    public getValue(): TValue {
        return this.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public apply(target): void { }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unapply(target): void { }

    public override getGameObjectName() {
        return 'OngoingEffectValueWrapper';
    }

    public isGainAbility(): this is GainAbility {
        return false;
    }
}
