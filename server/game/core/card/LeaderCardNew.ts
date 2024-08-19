import Player from '../Player';
import { EpicAction } from './propertyMixins/EpicAction';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { Exhaust } from './propertyMixins/Exhaust';
import { Cost } from './propertyMixins/Cost';
import { ArenaAbilities } from './propertyMixins/ArenaAbilities';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';

const LeaderCardParent = ArenaAbilities(Cost(Exhaust(NewCard)));

export class LeaderCardNew extends LeaderCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Leader));

        // TODO LEADER: add deploy epic action to this._actions (see Unit.ts for reference)
    }

    public override isLeader() {
        return true;
    }
}