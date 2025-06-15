import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export default class DetachedOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapper<TValue> {
    private state: Record<string, any> = {};

    public constructor(
        public applyFunc,
        public unapplyFunc
    ) {
        super(null);
        this.applyFunc = applyFunc;
        this.unapplyFunc = unapplyFunc;
    }

    public override apply(target: any) {
        this.state[target.uuid] = this.applyFunc(target, this.context, this.state[target.uuid]);
    }

    public override unapply(target: any) {
        this.state[target.uuid] = this.unapplyFunc(target, this.context, this.state[target.uuid]);
        if (this.state[target.uuid] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.state[target.uuid];
        }
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

