import type { AbilityContext } from '../../ability/AbilityContext';
import type Game from '../../Game';
import type { GameObject } from '../../GameObject';
import type { GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IDetachedOngoingEffectValueWrapperState<TTarget extends GameObject = GameObject> extends IGameObjectBaseState {
    targetStates: Map<string, GameObjectRef<TTarget>>;
}

export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue, IDetachedOngoingEffectValueWrapperState> {
    public readonly applyFunc: any;
    public readonly unapplyFunc: any;

    private get targetStates() {
        return this.state.targetStates;
    }

    public constructor(
        game: Game,
        applyFunc,
        unapplyFunc
    ) {
        super(game, null);
        this.applyFunc = applyFunc;
        this.unapplyFunc = unapplyFunc;
    }

    public override apply(target: any) {
        this.targetStates[target.uuid] = this.applyFunc(target, this.context, this.targetStates[target.uuid]);
    }

    public override unapply(target: any) {
        this.targetStates[target.uuid] = this.unapplyFunc(target, this.context, this.targetStates[target.uuid]);
        if (this.targetStates[target.uuid] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.targetStates[target.uuid];
        }
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const targetState of Object.values(this.targetStates)) {
            if (targetState.context) {
                targetState.context = context;
            }
        }
    }
}