import { AbilityContext } from '../../ability/AbilityContext';
import { EffectName } from '../../Constants';
import { EffectImpl } from './EffectImpl';

export default class DetachedEffectImpl<TValue> extends EffectImpl<TValue> {
    private state: Record<string, any> = {};

    constructor(type: EffectName,
        public applyFunc,
        public unapplyFunc) {
        // TODO: change lint rules to allow brace on next line in cases like the above
        super(type);
        this.applyFunc = applyFunc;
        this.unapplyFunc = unapplyFunc;
    }

    apply(target: any) {
        this.state[target.uuid] = this.applyFunc(target, this.context, this.state[target.uuid]);
    }

    unapply(target: any) {
        this.state[target.uuid] = this.unapplyFunc(target, this.context, this.state[target.uuid]);
        if (this.state[target.uuid] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.state[target.uuid];
        }
    }

    getValue(target: any) {
        return null;
    }

    recalculate(target: any): boolean {
        return false;
    }

    override setContext(context: AbilityContext) {
        super.setContext(context);
        for (const state of Object.values(this.state)) {
            if (state.context) {
                state.context = context;
            }
        }
    }
}

