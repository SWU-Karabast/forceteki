import type { InPlayCard } from '../card/baseClasses/InPlayCard';
import type { Card } from '../card/Card';
import { ZoneName } from '../Constants';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import { SimpleZone } from './SimpleZone';

export class CaptureZone extends SimpleZone<InPlayCard> {
    public readonly captor: InPlayCard;
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Capture;

    public constructor(owner: Player, captor: Card) {
        Contract.assertTrue(captor.isUnit(), `Attempting to create a capture zone with card ${captor.internalName} but it is not a unit card`);

        super(owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Capture;

        this.captor = captor;
    }

    public override addCard(card: InPlayCard) {
        Contract.assertFalse(this._cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);
        Contract.assertTrue(card.isNonLeaderUnit(), `Attempting to add card ${card.internalName} to ${this} but it is not a non-leader unit card`);

        this._cards.push(card);
    }

    public override toString() {
        return `${this.owner.name}:${this.captor.internalName}:${this.name}`;
    }
}
