import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import { PlayerZone } from './PlayerZone';

export class DiscardZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Discard;

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Discard;
    }
}