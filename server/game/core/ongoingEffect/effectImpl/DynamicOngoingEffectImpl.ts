import { AbilityContext } from '../../ability/AbilityContext';
import { EffectName } from '../../Constants';
import { OngoingEffectImpl } from './OngoingEffectImpl';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import StaticOngoingEffectImpl from './StaticOngoingEffectImpl';

// TODO: eventually this will subclass OngoingEffectImpl directly but I don't fully understand how it uses the apply()
// function inherited from StaticOngoingEffectImpl yet (seems like it shouldn't work)
export default class DynamicOngoingEffectImpl<TValue> extends StaticOngoingEffectImpl<TValue> {
    private values: Record<string, TValue> = {};

    public constructor(
        type: EffectName,
        private calculate: ((target: any, context: AbilityContext) => TValue)
    ) {
        super(type, null);
    }

    public override apply(target) {
        super.apply(target);
        this.recalculate(target);
    }

    public override recalculate(target) {
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

    public override getValue(target) {
        return this.values[target.uuid];
    }

    private setValue(target, value) {
        this.values[target.uuid] = value;
        return value;
    }
}

module.exports = DynamicOngoingEffectImpl;
