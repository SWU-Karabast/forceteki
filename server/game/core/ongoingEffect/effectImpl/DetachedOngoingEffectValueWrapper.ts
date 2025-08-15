import type { AbilityContext } from '../../ability/AbilityContext';
import type Game from '../../Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IDetachedOngoingEffectValueWrapperState extends IGameObjectBaseState {
    targetStates: Map<string, GameObjectRef>;
}

export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue, IDetachedOngoingEffectValueWrapperState> {
    public readonly applyFunc: any;
    public readonly unapplyFunc: any;

    public get targetStates(): ReadonlyMap<string, GameObjectBase> {
        const entries: [string, GameObjectBase][] = [];

        for (const [key, ref] of this.state.targetStates) {
            entries.push([key, this.game.getFromRef(ref)]);
        }

        return new Map(entries);
    }

    public set targetStates(value: Map<string, GameObjectBase>) {
        const entries: [string, GameObjectRef][] = [];

        for (const [key, gameObject] of value) {
            entries.push([key, gameObject.getRef()]);
        }

        this.state.targetStates = new Map(entries);
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

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.targetStates = new Map<string, GameObjectRef>();
    }

    public override apply(target: any) {
        const targetStates = this.targetStates;

        const currentValue = targetStates.get(target.uuid);
        const newValue = this.applyFunc(target, this.context, currentValue);

        this.targetStates = new Map(targetStates).set(target.uuid, newValue);
    }

    public override unapply(target: any) {
        const targetStates = this.targetStates;

        const currentValue = targetStates.get(target.uuid);
        const newValue = this.unapplyFunc(target, this.context, currentValue);
        if (newValue === undefined) {
            const updatedStates = new Map(targetStates);
            updatedStates.delete(target.uuid);
            this.targetStates = updatedStates;
        } else {
            this.targetStates = new Map(targetStates).set(target.uuid, newValue);
        }
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const [_uuid, targetState] of this.targetStates) {
            if (targetState && (targetState as any).context) {
                (targetState as any).context = context;
            }
        }
    }
}