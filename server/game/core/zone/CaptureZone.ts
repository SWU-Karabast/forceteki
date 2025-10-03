import type { IBaseCard } from '../card/BaseCard';
import type { Card } from '../card/Card';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import { registerState } from '../GameObjectUtils';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import { SimpleZone } from './SimpleZone';

export type ICaptorCard = IUnitCard | IBaseCard;

export interface ICardWithCaptureZone extends Card {
    get captureZone(): CaptureZone;
    get capturedUnits(): IUnitCard[];
}

// STATE TODO: Because these spawn during the Game's life span, do we need to make the captor a Ref? Hm, in-place no, but for file saves yes.
@registerState()
export class CaptureZone extends SimpleZone<IUnitCard> {
    public readonly captor: ICaptorCard;
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Capture;
    public declare owner: Player;

    public constructor(game: Game, owner: Player, captor: ICaptorCard) {
        Contract.assertTrue(captor.isUnit() || captor.isBase(), `Attempting to create a capture zone with card ${captor.internalName} but it is not a unit or base card`);

        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Capture;

        this.captor = captor;
    }

    public override addCard(card: IUnitCard) {
        Contract.assertTrue(card.isNonLeaderUnit(), `Attempting to add card ${card.internalName} to ${this} but it is not a non-leader unit card`);
        super.addCard(card);
    }

    public override toString() {
        return `${this.owner.name}:${this.captor.internalName}:${this.name}`;
    }
}
