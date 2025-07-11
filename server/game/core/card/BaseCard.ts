import type { Player } from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import * as Contract from '../utils/Contract';
import type { ICardWithDamageProperty } from './propertyMixins/Damage';
import { WithDamage } from './propertyMixins/Damage';
import type { ActionAbility } from '../ability/ActionAbility';
import type { IActionAbilityProps, IConstantAbilityProps, IEpicActionProps, ITriggeredAbilityProps } from '../../Interfaces';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import { WithTriggeredAbilities, type ICardWithTriggeredAbilities } from './propertyMixins/TriggeredAbilityRegistration';
import { WithConstantAbilities } from './propertyMixins/ConstantAbilityRegistration';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type { ICardWithActionAbilities } from './propertyMixins/ActionAbilityRegistration';
import { WithActionAbilities } from './propertyMixins/ActionAbilityRegistration';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import { EpicActionAbility } from '../../abilities/EpicActionAbility';
import type { IBaseAbilityRegistrar, IBasicAbilityRegistrar } from './AbilityRegistrationInterfaces';

const BaseCardParent = WithActionAbilities(WithConstantAbilities(WithTriggeredAbilities(WithDamage(WithStandardAbilitySetup(Card)))));

export interface IBaseCard extends ICardWithDamageProperty, ICardWithActionAbilities<IBaseCard>, ICardWithTriggeredAbilities<IBaseCard> {
    get epicActionSpent(): boolean;
}

/** A Base card (as in, the card you put in your base zone) */
export class BaseCard extends BaseCardParent implements IBaseCard {
    private _epicActionAbility?: EpicActionAbility;

    public get epicActionSpent() {
        Contract.assertNotNullLike(this._epicActionAbility, `Attempting to check if epic action for card ${this.internalName} is spent, but no epic action ability is set`);
        return this.epicActionSpentInternal();
    }

    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Base);
    }

    public override isBase(): this is IBaseCard {
        return true;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        this.setDamageEnabled(true);
        this.setActiveAttackEnabled(true);
    }

    public override getActionAbilities(): ActionAbility[] {
        if (this._epicActionAbility) {
            return super.getActionAbilities().concat(this._epicActionAbility);
        }

        return super.getActionAbilities();
    }

    public override canRegisterTriggeredAbilities(): this is ICardWithTriggeredAbilities<this> {
        return true;
    }

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        return super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbility {
        const ability = super.addConstantAbility(properties);
        ability.registeredEffects = this.addEffectToEngine(ability);
        return ability;
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
        const ability = super.addTriggeredAbility(properties);
        ability.registerEvents();
        return ability;
    }

    private setEpicActionAbility(properties: IEpicActionProps<this>): void {
        Contract.assertIsNullLike(this._epicActionAbility, 'Epic action ability already set');

        this._epicActionAbility = new EpicActionAbility(this.game, this, properties);
    }

    private epicActionSpentInternal(): boolean {
        return this._epicActionAbility ? this._epicActionAbility.limit.isAtMax(this.owner) : false;
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer),
            epicActionSpent: this.epicActionSpentInternal(),
            isDefender: this.isDefending(),
        };
    }

    protected override getAbilityRegistrar(): IBaseAbilityRegistrar {
        return {
            ...super.getAbilityRegistrar() as IBasicAbilityRegistrar<BaseCard>,
            setEpicActionAbility: (properties: IEpicActionProps<this>) => this.setEpicActionAbility(properties),
        };
    }

    protected override callSetupWithRegistrar() {
        this.setupCardAbilities(this.getAbilityRegistrar());
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override setupCardAbilities(registrar: IBaseAbilityRegistrar) { }
}
