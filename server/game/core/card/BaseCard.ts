import Player from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import * as Contract from '../utils/Contract';
import { WithDamage } from './propertyMixins/Damage';
import { ActionAbility } from '../ability/ActionAbility';
import AbilityHelper from '../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../Interfaces';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';

const BaseCardParent = WithDamage(WithStandardAbilitySetup(Card));

/** A Base card (as in, the card you put in your base zone) */
export class BaseCard extends BaseCardParent {
    private _epicActionAbility: ActionAbility;

    public get epicActionSpent() {
        return this._epicActionAbility.limit.isAtMax(this.owner);
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Base);
    }

    public override isBase(): this is BaseCard {
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

    protected setEpicActionAbility(properties: IEpicActionProps<this>): void {
        Contract.assertIsNullLike(this._epicActionAbility, 'Epic action ability already set');

        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: AbilityHelper.limit.epicAction()
        });

        this._epicActionAbility = new ActionAbility(this.game, this, propertiesWithLimit);
    }
}