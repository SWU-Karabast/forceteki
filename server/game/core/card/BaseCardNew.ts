import Player from '../Player';
import { EpicAction } from './propertyMixins/EpicAction';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { CardType } from '../Constants';
import Contract from '../utils/Contract';

const BaseCardParent = EpicAction(Hp(NewCard));

export class BaseCardNew extends BaseCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Base));

        this.enableDamage(true);
    }

    public override isBase() {
        return true;
    }
}