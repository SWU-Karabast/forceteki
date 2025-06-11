import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { EffectName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectImpl } from './OngoingEffectImpl';
import type Game from '../../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';

export interface IStaticOngoingEffectImplState<TValue> extends IGameObjectBaseState {
    valueWrapper: GameObjectRef<OngoingEffectValueWrapper<TValue>>;
}

export default class StaticOngoingEffectImpl<TValue, TState extends IStaticOngoingEffectImplState<TValue> = IStaticOngoingEffectImplState<TValue>> extends OngoingEffectImpl<TValue, TState> {
    public get valueWrapper() {
        return this.game.getFromRef(this.state.valueWrapper);
    }

    public override get effectDescription() {
        return this.valueWrapper.effectDescription;
    }

    public constructor(game: Game, type: EffectName, value: OngoingEffectValueWrapper<TValue> | TValue) {
        super(game, type);

        if (value instanceof OngoingEffectValueWrapper) {
            this.state.valueWrapper = value.getRef();
        } else {
            this.state.valueWrapper = new OngoingEffectValueWrapper(game, value).getRef();
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

