import type { AbilityContext } from '../../ability/AbilityContext';
import type Game from '../../Game';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue> {
    private targetStates: Record<string, any> = {};
    public readonly applyFunc: any;
    public readonly unapplyFunc: any;

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