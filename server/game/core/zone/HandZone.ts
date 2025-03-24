import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import { ZoneName, RelativePlayer } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import { PlayerZone } from './PlayerZone';

export class HandZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Hand;

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Hand;
    }
}
