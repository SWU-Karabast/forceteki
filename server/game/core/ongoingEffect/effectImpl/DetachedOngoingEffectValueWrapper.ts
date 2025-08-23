import type { AbilityContext } from '../../ability/AbilityContext';
import type Game from '../../Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import { registerState, undoMap } from '../../GameObjectUtils';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IDetachedOngoingEffectValueWrapperState extends IGameObjectBaseState {
    targetStates: Record<string, GameObjectRef>;
}

@registerState()
export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue, IDetachedOngoingEffectValueWrapperState> {
    public readonly applyFunc: any;
    public readonly unapplyFunc: any;

    @undoMap()
    private accessor _targetStates: Map<string, GameObjectBase> = new Map();

    public get targetStates(): ReadonlyMap<string, GameObjectBase> {
        return this._targetStates;
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
        const currentValue = this._targetStates.get(target.uuid);
        const newValue = this.applyFunc(target, this.context, currentValue);
        this._targetStates.set(target.uuid, newValue);
    }

    public override unapply(target: any) {
        const currentValue = this._targetStates.get(target.uuid);
        const newValue = this.unapplyFunc(target, this.context, currentValue);
        if (newValue === undefined) {
            this._targetStates.delete(target.uuid);
        } else {
            this._targetStates.set(target.uuid, newValue);
        }
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const [_uuid, targetState] of this._targetStates) {
            if (targetState && (targetState as any).context) {
                (targetState as any).context = context;
            }
        }
    }
}