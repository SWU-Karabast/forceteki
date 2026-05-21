import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';
import type { Player } from '../Player';
import { SimpleZone } from './SimpleZone';
import type { IAddRemoveZone } from './ZoneAbstract';
import { Contract } from '../utils/Contract';
import { registerStateBase } from '../GameObjectUtils';

/**
 * Base class for zones that are player specific.
 */
@registerStateBase()
export abstract class PlayerZone<TCard extends Card> extends SimpleZone<TCard> implements IAddRemoveZone {
    public abstract override readonly name: ZoneName;
    public declare readonly owner: Player;

    public override addCard(card: TCard) {
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);
        super.addCard(card);
    }
}
