import type { IAbilityPropsWithType, ITriggeredAbilityBaseProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type { Aspect, KeywordName } from '../Constants';
import type { LoseKeyword } from '../ongoingEffect/effectImpl/LoseKeyword';
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
        return false;
    }

    public hasCostValue(): this is KeywordWithCostValues {
        return false;
    }

    public hasAbilityDefinition(): this is KeywordWithAbilityDefinition {
        return false;
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

    public override hasNumericValue(): this is KeywordWithNumericValue {
        return true;
    }
}

export class KeywordWithCostValues extends KeywordInstance {
    public constructor(
        name: KeywordName,
        public readonly cost: number,
        public readonly aspects: Aspect[],
        public readonly additionalSmuggleCosts: boolean
    ) {
        super(name);
    }

    public override hasCostValue(): this is KeywordWithCostValues {
        return true;
    }
}

export class BountyKeywordInstance<TSource extends Card = Card> extends KeywordInstance {
    private _abilityProps?: Omit<ITriggeredAbilityBaseProps<TSource>, 'canBeTriggeredBy'> = null;

    public get abilityProps() {
        if (this._abilityProps == null) {
            Contract.fail(`Attempting to read property 'abilityProps' on a ${this.name} ability before it is defined`);
        }

        return this._abilityProps;
    }

    public override hasAbilityDefinition(): this is KeywordWithAbilityDefinition {
        return true;
    }

    public override get isFullyImplemented(): boolean {
        return this._abilityProps != null;
    }

    /** @param abilityProps Optional, but if not provided must be provided via `abilityProps` */
    public constructor(name: KeywordName, abilityProps: Omit<ITriggeredAbilityBaseProps<TSource>, 'canBeTriggeredBy'> = null) {
        super(name);
        this._abilityProps = abilityProps;
    }

    public setAbilityProps(abilityProps: Omit<ITriggeredAbilityBaseProps<TSource>, 'canBeTriggeredBy'>) {
        Contract.assertNotNullLike(abilityProps, `Attempting to set null ability definition for ${this.name}`);
        Contract.assertIsNullLike(this._abilityProps, `Attempting to set ability definition for ${this.name} but it already has a value`);

        this._abilityProps = abilityProps;
    }
}

export class KeywordWithAbilityDefinition<TSource extends Card = Card> extends KeywordInstance {
    private _abilityProps?: IAbilityPropsWithType<TSource> = null;

    public get abilityProps() {
        if (this._abilityProps == null) {
            Contract.fail(`Attempting to read property 'abilityProps' on a ${this.name} ability before it is defined`);
        }

        return this._abilityProps;
    }

    public override hasAbilityDefinition(): this is KeywordWithAbilityDefinition {
        return true;
    }

    public override get isFullyImplemented(): boolean {
        return this._abilityProps != null;
    }

    /** @param abilityProps Optional, but if not provided must be provided via `abilityProps` */
    public constructor(name: KeywordName, abilityProps: IAbilityPropsWithType<TSource> = null) {
        super(name);
        this._abilityProps = abilityProps;
    }

    public setAbilityProps(abilityProps: IAbilityPropsWithType<TSource>) {
        Contract.assertNotNullLike(abilityProps, `Attempting to set null ability definition for ${this.name}`);
        Contract.assertIsNullLike(this._abilityProps, `Attempting to set ability definition for ${this.name} but it already has a value`);

        this._abilityProps = abilityProps;
    }
}
