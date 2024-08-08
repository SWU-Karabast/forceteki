import { AbilityContext } from '../../ability/AbilityContext';
import { EffectName } from '../../Constants';
import { EffectImpl } from './EffectImpl';
import { EffectValue } from './EffectValue';
import StaticEffectImpl from './StaticEffectImpl';

// TODO: eventually this will subclass EffectImpl directly but I don't fully understand how it uses the apply()
// function inherited from StaticEffectImpl yet (seems like it shouldn't work)
export default class DynamicEffectImpl<TValue> extends StaticEffectImpl<TValue> {
    private values: Record<string, TValue> = {};

    constructor(
        type: EffectName,
        private calculate: ((target: any, context: AbilityContext) => TValue)
    ) {
        super(type, null);
    }

    override apply(target) {
        super.apply(target);
        this.recalculate(target);
    }

    override recalculate(target) {
        const oldValue = this.getValue(target);
        const newValue = this.setValue(target, this.calculate(target, this.context));
        if (typeof oldValue === 'function' && typeof newValue === 'function') {
            return oldValue.toString() !== newValue.toString();
        }
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        return oldValue !== newValue;
    }

    override getValue(target) {
        return this.values[target.uuid];
    }

    private setValue(target, value) {
        this.values[target.uuid] = value;
        return value;
    }
}

module.exports = DynamicEffectImpl;
