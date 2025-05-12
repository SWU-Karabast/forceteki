import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { EffectName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';

export default class StaticOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue> {
    public readonly valueWrapper: OngoingEffectValueWrapper<TValue>;

    public constructor(type: EffectName, value: OngoingEffectValueWrapper<TValue> | TValue) {
        super(type);

        if (value instanceof OngoingEffectValueWrapper) {
            this.valueWrapper = value;
        } else {
            this.valueWrapper = new OngoingEffectValueWrapper(value);
        }
    }

    public apply(target) {
        target.addOngoingEffect(this);
        this.valueWrapper.apply(target);
    }

    public unapply(target) {
        target.removeOngoingEffect(this);
        this.valueWrapper.unapply(target);
    }

    public getValue(target) {
        return this.valueWrapper.getValue();
    }

    public recalculate(target) {
        return false;
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        this.valueWrapper.setContext(context);
    }

    public override getDebugInfo() {
        return Object.assign(super.getDebugInfo(), { value: this.valueWrapper });
    }
}

