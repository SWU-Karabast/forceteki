
/** Collection of type checking utilities. */
export const is = {
    /** Checks if this is a *pure* object, it is not a function, array, or other object derived typed. */
    object(arg): arg is Record<any, any> {
        return arg != null && Object.prototype.toString.call(arg) === '[object Object]';
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function(arg): arg is Function {
        return arg != null && Object.prototype.toString.call(arg) === '[object Function]';
    },
    promise(arg): arg is Promise<any> {
        return arg != null && Object.prototype.toString.call(arg) === '[object Promise]';
    },
    string(arg): arg is string {
        return arg != null && Object.prototype.toString.call(arg) === '[object String]';
    },
    number(arg): arg is number {
        return arg != null && Object.prototype.toString.call(arg) === '[object Number]';
    },
    bool(arg): arg is boolean {
        return arg != null && Object.prototype.toString.call(arg) === '[object Boolean]';
    },
    date(arg): arg is Date {
        return arg != null && Object.prototype.toString.call(arg) === '[object Date]';
    },
    array(arg): arg is any[] {
        return arg != null && Array.isArray(arg);
    },
    error(arg): arg is Error {
        return arg != null && Object.prototype.toString.call(arg) === '[object Error]';
    },

    /**
     * Checks if value is or can be converted to a Date and that the Date is valid (non-NaN).
     * @param {string|number|Date|null} date
     */
    validDate(date: string | number | Date | null) {
        if (is.string(date) || is.number(date)) {
            date = new Date(date);
        }

        return is.date(date) && !isNaN(date.getTime());
    },
    validNumber(arg: string | number | null): boolean {
        if (arg == null) {
            return false;
        }

        if (is.string(arg)) {
            arg = to.float(arg);
        }

        return !isNaN(arg) && isFinite(arg);
    },
    validEmail(email: string) {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    },
    emptyObject(obj: Record<any, unknown>) {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Checks if value is a string, and that string is a valid date.
     * @param str
     */
    stringDate(str): str is string {
        return is.string(str) && is.validDate(str);
    },
};

/** Collection of type conversion utilities. */
export const to = {
    /**
     * Converts string to integer. If NaN, returns 0.
     */
    int(arg: string, defaultVal: number = 0) {
        const number = parseInt(arg, 10);
        return Number.isNaN(number) ? defaultVal : number;
    },

    /**
     * Converts string to float. If NaN, returns 0.
     */
    float(arg: string, defaultVal: number = 0) {
        const number = parseFloat(arg);
        return Number.isNaN(number) ? defaultVal : number;
    },
    // NOTE: this isn't trying to coerce a string into a boolean, rather it's checking if the value is the literal toString() result, IE if you'd written a boolean to localStorage.
    //       If necessary for a more general boolean conversion, create a boolLike method instead.
    /**
     * Converts string to bool if "true" or "false". If it is not a valid result, returns false.
     */
    bool(arg: string, defaultVal: boolean = false) {
        arg = arg?.toLocaleLowerCase();

        // We don't simply use `return arg === 'true'` because a non-value should be an invalid bool.
        if (arg === 'true') {
            return true;
        }
        if (arg === 'false') {
            return false;
        }

        return defaultVal;
    },

    /**
     * Ensures that the value passed will be a Date object if it can become one, or otherwise null.
     */
    date(date: string | number | Date | null): Date | null {
        if (is.string(date) || is.number(date)) {
            date = new Date(date);
        }

        return date;
    },

    record<T, TValue = T>(arr: T[], keyFunc: (item: T) => string | number, valueFunc?: (item: T) => TValue): Record<string | number, TValue> {
        const result: Record<string | number, TValue> = {};

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            const key = keyFunc(item);
            result[key] = valueFunc ? valueFunc(item) : item as unknown as TValue;
        }

        return result;
    }
};