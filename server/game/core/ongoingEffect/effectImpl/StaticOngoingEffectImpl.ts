import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { EffectName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';
import type Game from '../../Game';

export default class StaticOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue> {
    public readonly valueWrapper: OngoingEffectValueWrapper<TValue>;

    public override get effectDescription() {
        return this.valueWrapper.effectDescription;
    }

    public constructor(game: Game, type: EffectName, value: OngoingEffectValueWrapper<TValue> | TValue) {
        super(game, type);

        if (value instanceof OngoingEffectValueWrapper) {
            this.valueWrapper = value;
        } else {
            this.valueWrapper = new OngoingEffectValueWrapper(game, value);
        }
    }

    public apply(effect, target) {
        target.addOngoingEffect(effect);
        this.valueWrapper.apply(target);
    }

    public unapply(effect, target) {
        target.removeOngoingEffect(effect);
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

