import type { AbilityContext } from '../../ability/AbilityContext';
import type { EffectName } from '../../Constants';
import { OngoingEffectImpl } from './OngoingEffectImpl';

export default class DetachedOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue> {
    private state: Record<string, any> = {};

    public constructor(type: EffectName,
        public applyFunc,
        public unapplyFunc
    ) {
        super(type);
        this.applyFunc = applyFunc;
        this.unapplyFunc = unapplyFunc;
    }

    public apply(target: any) {
        this.state[target.uuid] = this.applyFunc(target, this.context, this.state[target.uuid]);
    }

    public unapply(target: any) {
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

