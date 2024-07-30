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

// convert a set of strings to map to an enum type, throw if any of them is not a legal value
export function checkConvertToEnum<T>(values: string[], enumObj: T): Array<T[keyof T]> {
    let result: Array<T[keyof T]> = [];

    for (const value of values) {
        if (Object.values(enumObj).indexOf(value.toLowerCase()) >= 0) {
            result.push(value as T[keyof T]);
        } else {
            throw new Error(`Invalid value for enum: ${value}`);
        }
    }

    return result;
}