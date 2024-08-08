import type { AbilityContext } from '../../ability/AbilityContext';

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

    public setValue(value: V) {
        this.value = value;
    }

    public getValue(): V {
        return this.value;
    }

    public recalculate(): boolean {
        return false;
    }

    // TODO: should probably have a subclass that adds these instead of having them empty here
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public reset(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public apply(target): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public unapply(target): void {}
}
