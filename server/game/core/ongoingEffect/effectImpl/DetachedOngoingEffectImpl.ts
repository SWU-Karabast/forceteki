import type { AbilityContext } from '../../ability/AbilityContext';
import type { EffectName } from '../../Constants';
import type Game from '../../Game';
import type { IGameObjectBaseState } from '../../GameObjectBase';
import { OngoingEffectImpl } from './OngoingEffectImpl';

// STATE ISSUE: This does not work; `state` is often a function.
export interface IStaticOngoingEffectImplState<TValue> extends IGameObjectBaseState {
    state: Record<string, any>;
}

export default class DetachedOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue, IStaticOngoingEffectImplState<TValue>> {
    public readonly applyFunc;
    public readonly unapplyFunc;

    public constructor(game: Game,
        type: EffectName,
        applyFunc,
        unapplyFunc
    ) {
        super(game, type);
        this.applyFunc = applyFunc;
        this.unapplyFunc = unapplyFunc;
    }

    protected override setupDefaultState(): void {
        super.setupDefaultState();
        this.state.state = {};
    }

    public apply(effect, target: any) {
        this.state[target.uuid] = this.applyFunc(target, this.context, this.state[target.uuid]);
    }

    public unapply(effect, target: any) {
        this.state[target.uuid] = this.unapplyFunc(target, this.context, this.state[target.uuid]);
        if (this.state[target.uuid] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.state[target.uuid];
        }
    }

    public getValue(target: any) {
        return null;
    }

    public recalculate(target: any): boolean {
        return false;
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const state of Object.values(this.state)) {
            if (state.context) {
                state.context = context;
            }
        }
    }
}

