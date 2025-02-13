import type Player from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import * as Contract from '../utils/Contract';
import type { ICardWithDamageProperty } from './propertyMixins/Damage';
import { WithDamage } from './propertyMixins/Damage';
import { ActionAbility } from '../ability/ActionAbility';
import type { IActionAbilityProps, IConstantAbilityProps, IEpicActionProps, ITriggeredAbilityProps } from '../../Interfaces';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import { EpicActionLimit } from '../ability/AbilityLimit';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type { IInPlayCard } from './baseClasses/InPlayCard';

const BaseCardParent = WithDamage(WithStandardAbilitySetup(Card));

export interface IBaseCard extends ICardWithDamageProperty {
    get epicActionSpent(): boolean;
}

/** A Base card (as in, the card you put in your base zone) */
export class BaseCard extends BaseCardParent implements IBaseCard {
    private _epicActionAbility: ActionAbility;

    public get epicActionSpent() {
        Contract.assertNotNullLike(this._epicActionAbility, `Attempting to check if epic action for card ${this.internalName} is spent, but no epic action ability is set`);
        return this.epicActionSpentInternal();
    }

    public constructor(owner: Player, cardData: any) {
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

    public override canRegisterTriggeredAbilities(): this is IInPlayCard | IBaseCard {
        return true;
    }

    // TODO TYPE REFACTOR: this method is duplicated
    protected addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbilityProps<this> {
        const ability = this.createConstantAbility(properties);
        ability.registeredEffects = this.addEffectToEngine(ability);
        this.constantAbilities.push(ability);
        return ability;
    }

    protected setEpicActionAbility(properties: IEpicActionProps<this>): void {
        Contract.assertIsNullLike(this._epicActionAbility, 'Epic action ability already set');

        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: new EpicActionLimit()
        });

        this._epicActionAbility = new ActionAbility(this.game, this, propertiesWithLimit);
    }

    protected addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
        if (!this.triggeredAbilities) {
            this.triggeredAbilities = [];
        }
        const ability = this.createTriggeredAbility(properties);
        this.triggeredAbilities.push(ability);
        ability.registerEvents();
        return ability;
    }

    public getTriggeredAbilities(): TriggeredAbility[] {
        return this.triggeredAbilities;
    }

    private epicActionSpentInternal(): boolean {
        return this._epicActionAbility ? this._epicActionAbility.limit.isAtMax(this.owner) : false;
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer),
            epicActionSpent: this.epicActionSpentInternal()
        };
    }
}
