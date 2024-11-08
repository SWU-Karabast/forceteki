import { IAbilityPropsWithType, ITriggeredAbilityProps } from '../../Interfaces';
import { Card } from '../card/Card';
import { Aspect, KeywordName } from '../Constants';
import { LoseKeyword } from '../ongoingEffect/effectImpl/LoseKeyword';
import * as Contract from '../utils/Contract';

export class KeywordInstance {
    private blankingEffects: LoseKeyword[] = [];

    public get isBlank() {
        return this.blankingEffects.length > 0;
    }

    /*
     * If false, this keyword instance requires some explicit implementation data
     * (such as a Bounty ability definition) that has not yet been provided
     */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isFullyImplemented(): boolean {
        return true;
    }

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

    public registerBlankingEffect(blankingEffect: LoseKeyword) {
        this.blankingEffects.push(blankingEffect);
    }

    public unregisterBlankingEffect(blankingEffect: LoseKeyword) {
        this.blankingEffects = this.blankingEffects.filter((effect) => effect !== blankingEffect);
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

export class KeywordWithAbilityDefinition<TSource extends Card = Card> extends KeywordInstance {
    private _abilityProps?: ITriggeredAbilityProps<TSource> = null;

    public get abilityProps() {
        if (this._abilityProps == null) {
            Contract.fail(`Attempting to read property 'abilityProps' on a ${this.name} ability before it is defined`);
        }

        return this._abilityProps;
    }

    public override get isFullyImplemented(): boolean {
        return this._abilityProps != null;
    }

    /** @param abilityProps Optional, but if not provided must be provided via {@link KeywordWithAbilityDefinition.setAbilityProps} */
    public constructor(name: KeywordName, abilityProps: ITriggeredAbilityProps<TSource> = null) {
        super(name);
        this._abilityProps = abilityProps;
    }

    public setAbilityProps(abilityProps: ITriggeredAbilityProps<TSource>) {
        Contract.assertNotNullLike(abilityProps, `Attempting to set null ability definition for ${this.name}`);
        Contract.assertIsNullLike(this._abilityProps, `Attempting to set ability definition for ${this.name} but it already has a value`);

        this._abilityProps = abilityProps;
    }
}
