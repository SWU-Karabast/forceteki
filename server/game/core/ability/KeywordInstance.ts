import type { IAbilityPropsWithType, ITriggeredAbilityBaseProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import { EffectName, RelativePlayer, type Aspect, type KeywordName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';

export class KeywordInstance {
    public readonly name: KeywordName;

    private readonly card: Card;

    public get isBlank() {
        if (EnumHelpers.isHiddenFromOpponent(this.card.zoneName, RelativePlayer.Self) && this.hasCostValue()) {
            return false;
        }

        if (this.card.isBlank()) {
            return true;
        }

        const blankedKeywords: string[] = this.card.getOngoingEffectValues(EffectName.LoseKeyword);
        return blankedKeywords.includes(this.name);
    }

    /*
     * If false, this keyword instance requires some explicit implementation data
     * (such as a Bounty ability definition) that has not yet been provided
     */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isFullyImplemented(): boolean {
        return true;
    }

    public constructor(name: KeywordName, card: Card) {
        this.name = name;
        this.card = card;
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
}

export class KeywordWithNumericValue extends KeywordInstance {
    public constructor(
        name: KeywordName,
        card: Card,
        public readonly value: number
    ) {
        super(name, card);
    }

    public override hasNumericValue(): this is KeywordWithNumericValue {
        return true;
    }
}

export class KeywordWithCostValues extends KeywordInstance {
    public constructor(
        name: KeywordName,
        card: Card,
        public readonly cost: number,
        public readonly aspects: Aspect[],
        public readonly additionalCosts: boolean,
    ) {
        super(name, card);
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
    public constructor(name: KeywordName, card: Card, abilityProps: Omit<ITriggeredAbilityBaseProps<TSource>, 'canBeTriggeredBy'> = null) {
        super(name, card);
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
    public constructor(name: KeywordName, card: Card, abilityProps: IAbilityPropsWithType<TSource> = null) {
        super(name, card);
        this._abilityProps = abilityProps;
    }

    public setAbilityProps(abilityProps: IAbilityPropsWithType<TSource>) {
        Contract.assertNotNullLike(abilityProps, `Attempting to set null ability definition for ${this.name}`);
        Contract.assertIsNullLike(this._abilityProps, `Attempting to set ability definition for ${this.name} but it already has a value`);

        this._abilityProps = abilityProps;
    }
}
