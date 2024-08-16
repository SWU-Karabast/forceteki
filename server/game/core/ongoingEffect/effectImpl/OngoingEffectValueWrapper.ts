import type { AbilityContext } from '../../ability/AbilityContext';

export class OngoingEffectValueWrapper<TValue> {
    value: TValue;
    context?: AbilityContext;

    constructor(value: TValue) {
        // @ts-expect-error
        this.value = value == null ? true : value;
    }

    public setContext(context: AbilityContext): void {
        this.context = context;
    }

    public getValue(): TValue {
        return this.value;
    }

    public recalculate(): boolean {
        return false;
    }

    // TODO: should probably have a subclass that adds these instead of having them empty here
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public reset(): void { }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public apply(target): void { }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unapply(target): void { }
}
