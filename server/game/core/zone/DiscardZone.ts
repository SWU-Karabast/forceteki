import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import { ZoneName } from '../Constants';
import type Game from '../Game';
import { registerState } from '../GameObjectUtils';
import type { Player } from '../Player';
import { PlayerZone } from './PlayerZone';

@registerState()
export class DiscardZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Discard;

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Discard;
    }
}