import { OngoingEffectValueWrapper, OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import type { EffectName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';
import type { Game } from '../../Game';
import { registerState, registerStateBase, stateRef } from '../../GameObjectUtils';

@registerStateBase()
export abstract class StaticOngoingEffectImplBase<TValue> extends OngoingEffectImpl<TValue> {
    @stateRef()
    private accessor _valueWrapper: OngoingEffectValueWrapperBase<TValue>;

    public override get valueWrapper() {
        return this._valueWrapper;
    }

    public override get effectDescription() {
        return this.valueWrapper.effectDescription;
    }

    public constructor(game: Game, type: EffectName, value: OngoingEffectValueWrapperBase<TValue> | TValue) {
        super(game, type);

        if (value instanceof OngoingEffectValueWrapperBase) {
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

@registerState()
export class StaticOngoingEffectImpl<TValue> extends StaticOngoingEffectImplBase<TValue> {
    public override getGameObjectName() {
        return 'StaticOngoingEffectImpl';
    }
}