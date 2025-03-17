import type { Card } from '../card/Card';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import { SimpleZone } from './SimpleZone';

export class CaptureZone extends SimpleZone<IUnitCard> {
    public readonly captor: IUnitCard;
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Capture;

    public constructor(game: Game, owner: Player, captor: Card) {
        Contract.assertTrue(captor.isUnit(), `Attempting to create a capture zone with card ${captor.internalName} but it is not a unit card`);

        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Capture;

        this.captor = captor;
    }

    public override addCard(card: IUnitCard) {
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);
        Contract.assertTrue(card.isNonLeaderUnit(), `Attempting to add card ${card.internalName} to ${this} but it is not a non-leader unit card`);

        this.state.cards.push(card.getRef());
    }

    public override toString() {
        return `${this.owner.name}:${this.captor.internalName}:${this.name}`;
    }
}
