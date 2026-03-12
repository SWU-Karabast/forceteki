/**
 * Decorator that marks a class property as non-enumerable.
 * This prevents the property from appearing in `for...in` loops, `Object.keys()`, etc.
 * Specifically, it prevents the property from being serialized via JSON.stringify or similar methods,
 * useful if we want to ignore a property that could cause a circular reference error.
 *
 * @example
 * ⁣@nonEnumerable game: Game = undefined;
 */
export function nonEnumerable(_target: undefined, context: ClassFieldDecoratorContext) {
    // Uses `addInitializer` so that the property is redefined after the field is set.
    context.addInitializer(function (this: object) {
        // eslint-disable-next-line no-invalid-this
        const descriptor = Object.getOwnPropertyDescriptor(this, context.name);
        if (descriptor && descriptor.enumerable !== false) {
            // eslint-disable-next-line no-invalid-this
            Object.defineProperty(this, context.name, {
                ...descriptor,
                enumerable: false,
            });
        }
    });
}