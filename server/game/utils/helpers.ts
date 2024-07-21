/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function randomItem<T>(array: T[]): undefined | T {
    const j = Math.floor(Math.random() * array.length);
    return array[j];
}

export type Derivable<T extends boolean | string | number | Array<any>, C> = T | ((context: C) => T);

export function derive<T extends boolean | string | number | Array<any>, C>(input: Derivable<T, C>, context: C): T {
    return typeof input === 'function' ? input(context) : input;
}