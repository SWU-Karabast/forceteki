import Player from '../Player';
import { PrintedHp } from './propertyMixins/PrintedHp';
import { NewCard } from './NewCard';
import { Cost } from './propertyMixins/Cost';
import { OngoingAbilityCard } from './OngoingAbilityCard';
import Contract from '../utils/Contract';
import { CardType } from '../Constants';
import { PlayableOrDeployableCard } from './PlayableOrDeployableCard';

export class LeaderCardNew extends OngoingAbilityCard {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Leader));

        // TODO LEADER: add deploy epic action to this._actions (see Unit.ts for reference)
    }

    public override isLeader() {
        return true;
    }
}