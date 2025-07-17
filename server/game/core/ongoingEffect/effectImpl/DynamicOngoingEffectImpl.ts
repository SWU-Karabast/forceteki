import type { AbilityContext } from '../../ability/AbilityContext';
import type { EffectName } from '../../Constants';
import type Game from '../../Game';
import { GameObject } from '../../GameObject';
import type { GameObjectRef } from '../../GameObjectBase';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { IStaticOngoingEffectImplState } from './StaticOngoingEffectImpl';
import StaticOngoingEffectImpl from './StaticOngoingEffectImpl';

export type CalculateOngoingEffect<TValue> = (target: any, context: AbilityContext, game: Game) => TValue;
export type CalculateOngoingEffectValueWrapper<TValue> = (target: any, context: AbilityContext, game: Game) => TValue | OngoingEffectValueWrapper<TValue>;
export interface IDynamicOngoingEffectImpl<TValue> extends IStaticOngoingEffectImplState<TValue> {
    values: Record<string, GameObjectRef<OngoingEffectValueWrapper<TValue>>>;
}


// TODO: eventually this will subclass OngoingEffectImpl directly
export default class DynamicOngoingEffectImpl<TValue> extends StaticOngoingEffectImpl<TValue, IDynamicOngoingEffectImpl<TValue>> {
    private readonly calculate: CalculateOngoingEffectValueWrapper<TValue>;

    public constructor(game: Game,
        type: EffectName,
        calculate: CalculateOngoingEffectValueWrapper<TValue>
    ) {
        super(game, type, null);
        this.calculate = calculate;
    }

    public override setupDefaultState(): void {
        super.setupDefaultState();
        this.state.values = {};
    }

    public override apply(effect, target) {
        super.apply(effect, target);

        this.recalculate(target);
    }

    public override recalculate(target) {
        const oldValue = this.getValue(target);
        const newValue = this.recalculateValue(target, this.context);

        if (this.compareValues(oldValue, newValue.getValue())) {
            this.setValue(target, newValue);
            return true;
        }

        return false;
    }

    public override getValue(target) {
        return this.game.getFromRef(this.state.values[target.uuid])?.getValue();
    }

    private setValue(target: GameObject, value: OngoingEffectValueWrapper<TValue>) {
        this.game.getFromRef(this.state.values[target.uuid])?.unapply(target);
        this.state.values[target.uuid] = value.getRef();
        value.apply(target);
        return value.getValue();
    }

    private recalculateValue(target, context: AbilityContext): OngoingEffectValueWrapper<TValue> {
        const value = this.calculate(target, context, this.game);

        if (value instanceof OngoingEffectValueWrapper) {
            return value;
        }

        return new OngoingEffectValueWrapper(this.game, value);
    }

    private compareValues(oldValue: TValue, newValue: TValue) {
        // TODO: these comparison methods are really inefficient, consider a more explicit comparison implementation
        if (typeof oldValue === 'function' && typeof newValue === 'function') {
            return oldValue.toString() !== newValue.toString();
        }

        if (
            (Array.isArray(oldValue) && Array.isArray(newValue)) ||
            (typeof oldValue === 'object' && typeof newValue === 'object')
        ) {
            // Define a replacer function to handle complex objects that contain references to GameObjects.
            // Because each GameObject has a reference to the game instance and the game instance has a reference
            // to all GameObjects, we need to break the circular reference to be able to serialize the object and
            // we do so by replacing the GameObject with its uuid.
            const replacer = (key: string, value: any) => {
                if (value instanceof GameObject) {
                    return value.uuid;
                }
                return value;
            };

            return JSON.stringify(oldValue, replacer) !== JSON.stringify(newValue, replacer);
        }

        return oldValue !== newValue;
    }
}

module.exports = DynamicOngoingEffectImpl;
