import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';
import type Player from '../Player';
import type { IZoneState } from './SimpleZone';
import { SimpleZone } from './SimpleZone';
import type { IAddRemoveZone } from './ZoneAbstract';
import * as Contract from '../utils/Contract';

/**
 * Base class for zones that are player specific.
 */
export abstract class PlayerZone<TCard extends Card, TState extends IZoneState<TCard> = IZoneState<TCard>> extends SimpleZone<TCard, TState> implements IAddRemoveZone {
    public abstract override readonly name: ZoneName;
    public override readonly owner: Player;

    public override addCard(card: TCard) {
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);
        super.addCard(card);
    }
}
