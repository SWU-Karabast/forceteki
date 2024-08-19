import Player from '../Player';
import { PrintedHp } from './propertyMixins/PrintedHp';
import { NewCard } from './NewCard';
import { Cost } from './propertyMixins/Cost';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';

export class LeaderCardNew extends InPlayCard {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Leader));

        // TODO LEADER: add deploy epic action (see Base.ts for reference)
    }

    public override isLeader() {
        return true;
    }
}