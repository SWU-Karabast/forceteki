import type { AbilityContext } from '../../ability/AbilityContext';

// UP NEXT: rename this to EffectValueWrapper
export class EffectValue<V> {
    value: V;
    context?: AbilityContext;

    constructor(value: V) {
        // @ts-expect-error
        this.value = value == null ? true : value;
    }

    public setContext(context: AbilityContext): void {
        this.context = context;
    }

    public getValue(): V {
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
