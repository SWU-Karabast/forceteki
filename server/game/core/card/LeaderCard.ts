import Player from '../Player';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';

export class LeaderCard extends InPlayCard {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Leader);

        // TODO LEADER: add deploy epic action (see Base.ts for reference)
    }

    public override isLeader(): this is LeaderCard {
        return true;
    }
}