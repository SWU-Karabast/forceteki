import type { AbilityContext } from '../../ability/AbilityContext';
import type Game from '../../Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import { registerState, undoRecord } from '../../GameObjectUtils';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IDetachedOngoingEffectValueWrapperState extends IGameObjectBaseState {
    targetStates: Record<string, GameObjectRef>;
}

@registerState()
export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue, IDetachedOngoingEffectValueWrapperState> {
    public readonly applyFunc: any;
    public readonly unapplyFunc: any;

    @undoRecord()
    private accessor _targetStates: Record<string, GameObjectBase> = {};

    public get targetStates(): Readonly<Record<string, GameObjectBase>> {
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
        const currentValue = this._targetStates[target.uuid];
        const newValue = this.applyFunc(target, this.context, currentValue);
        this._targetStates[target.uuid] = newValue;
    }

    public override unapply(target: any) {
        const currentValue = this._targetStates[target.uuid];
        const newValue = this.unapplyFunc(target, this.context, currentValue);
        if (newValue === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this._targetStates[target.uuid];
        } else {
            this._targetStates[target.uuid] = newValue;
        }
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const [_uuid, targetState] of Object.entries(this.targetStates)) {
            if (targetState && (targetState as any).context) {
                (targetState as any).context = context;
            }
        }
    }
}