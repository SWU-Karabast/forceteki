import Player from '../Player';
import { Card } from './Card';
import { CardType, EffectName } from '../Constants';
import * as Contract from '../utils/Contract';
import { WithDamage } from './propertyMixins/Damage';
import { ActionAbility } from '../ability/ActionAbility';
import AbilityHelper from '../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../Interfaces';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import { IOngoingCardEffect } from '../ongoingEffect/IOngoingCardEffect';

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

        this.setDamageEnabled(true);
        this.setActiveAttackEnabled(true);
    }

    public override isBase(): this is BaseCard {
        return true;
    }

    public override getActionAbilities(): ActionAbility[] {
        if (this._epicActionAbility) {
            return super.getActionAbilities().concat(this._epicActionAbility);
        }

        return super.getActionAbilities();
    }

    public setEpicActionAbility(properties: IEpicActionProps<this>): void {
        Contract.assertTrue(this._epicActionAbility == null, 'Epic action ability already set');

        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: AbilityHelper.limit.epicAction()
        });

        this._epicActionAbility = new ActionAbility(this.game, this, propertiesWithLimit);
    }

    public override addDamage(amount: number) {
        super.addDamage(amount);

        // TODO EFFECTS: the win effect should almost certainly be handled elsewhere, probably in a game state check
        if (this.damage >= this.getHp()) {
            this.game.recordWinner(this.owner.opponent, 'base destroyed');
        }
    }
}