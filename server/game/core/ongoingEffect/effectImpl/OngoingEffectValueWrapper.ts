import type { AbilityContext } from '../../ability/AbilityContext';
import type { FormatMessage } from '../../chat/GameChat';

export class OngoingEffectValueWrapper<TValue> {
    private value: TValue;
    public context?: AbilityContext;

    public constructor(value: TValue, public effectDescription?: FormatMessage) {
        // @ts-expect-error
        this.value = value == null ? true : value;
    }

    public setContext(context: AbilityContext): void {
        this.context = context;
    }

    public getValue(): TValue {
        return this.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public apply(target): void { }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unapply(target): void { }
}
