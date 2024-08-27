import { Aspect, KeywordName } from '../Constants';

export class KeywordInstance {
    public constructor(
        public readonly name: KeywordName
    ) {
    }

    public hasNumericValue(): this is KeywordWithNumericValue {
        return this instanceof KeywordWithNumericValue;
    }

    public valueOf() {
        return this.name;
    }
}

export class KeywordWithNumericValue extends KeywordInstance {
    public constructor(
        name: KeywordName,
        public readonly value: number
    ) {
        super(name);
    }
}

export class KeywordWithCostValues extends KeywordInstance {
    public constructor(
        name: KeywordName,
        public readonly cost: number,
        public readonly costAspects: Aspect[]
    ) {
        super(name);
    }
}