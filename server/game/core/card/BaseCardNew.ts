import Player from '../Player';
import { EpicAction } from './propertyMixins/EpicAction';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';

const BaseCardParent = EpicAction(Hp(NewCard));

export class BaseCardNew extends BaseCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);

        this.enableDamage(true);
    }
}