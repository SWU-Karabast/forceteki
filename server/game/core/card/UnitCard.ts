import Player from '../Player';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { Exhaust } from './propertyMixins/Exhaust';
import { Cost } from './propertyMixins/Cost';
import { ArenaAbilities } from './propertyMixins/ArenaAbilities';
import { Power } from './propertyMixins/Power';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';

const UnitCardParent = ArenaAbilities(Power(Hp(Cost(Exhaust(NewCard)))));

export class UnitCard extends UnitCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Unit));

        this._actions.push(new InitiateAttackAction(this.generateOriginalCard()));
        this._actions.push(new PlayUnitAction(this.generateOriginalCard()));
    }

    public override isUnit() {
        return true;
    }

    public override isNonLeaderUnit() {
        return true;
    }
}