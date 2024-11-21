import { TokenOrPlayableCard, UnitCard } from '../card/CardTypes';
import { ZoneName, RelativePlayer } from '../Constants';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import { SimpleZone } from './SimpleZone';

export class CaptureZone extends SimpleZone<TokenOrPlayableCard> {
    public readonly captor: UnitCard;
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Capture;

    public constructor(owner: Player, captor: UnitCard) {
        super(owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Capture;

        this.captor = captor;
    }

    public override addCard(card: TokenOrPlayableCard) {
        Contract.assertTrue(card.isNonLeaderUnit(), `Attempting to add card ${card.internalName} to ${this} but it is not a non-leader unit card`);

        super.addCard(card);
    }

    public override toString() {
        return `${this.owner.name}:${this.captor.internalName}:${this.name}`;
    }
}
