import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { EffectName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';
import type Game from '../../Game';
import { registerState, undoObject } from '../../GameObjectUtils';

@registerState()
export default class StaticOngoingEffectImpl<TValue> extends OngoingEffectImpl<TValue> {
    @undoObject()
    private accessor _valueWrapper: OngoingEffectValueWrapper<TValue>;

    public get valueWrapper() {
        return this._valueWrapper;
    }

    public override get effectDescription() {
        return this.valueWrapper.effectDescription;
    }

    public constructor(game: Game, type: EffectName, value: OngoingEffectValueWrapper<TValue> | TValue) {
        super(game, type);

        if (value instanceof OngoingEffectValueWrapper) {
            this._valueWrapper = value;
        } else {
            this._valueWrapper = new OngoingEffectValueWrapper(game, value);
        }
    }

    public apply(effect, target) {
        target.addOngoingEffect(effect);
        this._valueWrapper.apply(target);
    }

    public unapply(effect, target) {
        target.removeOngoingEffect(effect);
        this._valueWrapper.unapply(target);
    }

    public getValue(target) {
        return this._valueWrapper.getValue();
    }

    public recalculate(target) {
        return false;
    }

    public override setContext(context: AbilityContext) {
        super.setContext(context);
        this._valueWrapper.setContext(context);
    }

    public override getDebugInfo() {
        return Object.assign(super.getDebugInfo(), { value: this._valueWrapper });
    }
}

