import type { Card } from '../card/Card';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import { registerState } from '../GameObjectUtils';
import type { Player } from '../Player';
import { PlayerZone } from './PlayerZone';

/**
 * Catch-all zone for cards that are outside the game. Used for staging cards such as tokens.
 */
@registerState()
export class OutsideTheGameZone extends PlayerZone<Card> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.OutsideTheGame;

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.OutsideTheGame;
    }
}
