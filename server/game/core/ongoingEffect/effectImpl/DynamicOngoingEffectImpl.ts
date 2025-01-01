import type { AbilityContext } from '../../ability/AbilityContext';
import type { EffectName } from '../../Constants';
import StaticOngoingEffectImpl from './StaticOngoingEffectImpl';

// TODO: eventually this will subclass OngoingEffectImpl directly
export default class DynamicOngoingEffectImpl<TValue> extends StaticOngoingEffectImpl<TValue> {
    private values: Record<string, TValue> = {};

    public constructor(
        type: EffectName,
        private calculate: ((target: any, context: AbilityContext) => TValue)
    ) {
        super(type, null);
    }

    public override apply(target) {
        // TODO: these two calls were in the reverse order in l5r, not sure if that was required for some reason
        this.recalculate(target);
        super.apply(target);
    }

    public override recalculate(target) {
        const oldValue = this.getValue(target);
        const newValue = this.setValue(target, this.calculate(target, this.context));
        if (typeof oldValue === 'function' && typeof newValue === 'function') {
            return oldValue.toString() !== newValue.toString();
        }
        if (
            (Array.isArray(oldValue) && Array.isArray(newValue)) ||
            (typeof oldValue === 'object' && typeof newValue === 'object')
        ) {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        return oldValue !== newValue;
    }

    public override getValue(target) {
        return this.values[target.uuid];
    }

    private setValue(target, value) {
        this.values[target.uuid] = value;
        return value;
    }
}

module.exports = DynamicOngoingEffectImpl;
