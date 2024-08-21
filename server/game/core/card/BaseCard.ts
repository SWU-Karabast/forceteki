import Player from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import Contract from '../utils/Contract';
import { WithDamage } from './propertyMixins/Damage';
import { CardActionAbility } from '../ability/CardActionAbility';
import AbilityHelper from '../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../Interfaces';

const BaseCardParent = WithDamage(Card);

/** A Base card (as in, the card you put in your base zone) */
export class BaseCard extends BaseCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue(this.printedType === CardType.Base);

        this.enableDamage(true);
    }

    public override isBase() {
        return true;
    }

    public addEpicActionAbility(properties: IEpicActionProps<this>): void {
        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: AbilityHelper.limit.perGame(1),
        });

        this._actionAbilities.push(new CardActionAbility(this.game, this, propertiesWithLimit));
    }
}