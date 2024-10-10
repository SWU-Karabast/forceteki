import { Aspect, KeywordName } from '../Constants';

export class KeywordInstance {
    public constructor(
        public readonly name: KeywordName
    ) {
    }

    public hasNumericValue(): this is KeywordWithNumericValue {
        return this instanceof KeywordWithNumericValue;
    }

    public hasCostValue(): this is KeywordWithCostValues {
        return this instanceof KeywordWithCostValues;
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
        public readonly aspects: Aspect[],
        public readonly additionalCosts: boolean // TODO: implement additional costs (First Light)
    ) {
        super(name);
    }
}