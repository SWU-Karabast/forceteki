import Player from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import Contract from '../utils/Contract';
import { Damage } from './propertyMixins/Damage';
import { CardActionAbility } from '../ability/CardActionAbility';
import AbilityHelper from '../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../Interfaces';

const BaseCardParent = Damage(Card);

export class BaseCard extends BaseCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Base));

        this.enableDamage(true);
    }

    public override isBase() {
        return true;
    }

    public addEpicActionAbility(properties: IEpicActionProps<this>): void {
        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: AbilityHelper.limit.perGame(1),
        });

        this.actions.push(new CardActionAbility(this.game, this, propertiesWithLimit));
    }
}