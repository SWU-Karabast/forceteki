import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import { ZoneName, RelativePlayer } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class HandZone extends SimpleZone<IPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Hand;

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Hand;
    }
}
