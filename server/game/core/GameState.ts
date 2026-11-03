import type { Card } from './card/Card';
import type { PhaseName } from './Constants';
import type { Game } from './Game';
import { GameObjectBase } from './GameObjectBase';
import { registerState, statePrimitive, stateArray, stateRef } from './GameObjectUtils';
import type { GameObjectId } from './GameObjectUtils';
import type { Player } from './Player';

/**
 * The game-wide scalars and lists behind `Game`'s state-backed accessors. `Game` constructs one instance and
 * never replaces it, so it is snapshotted, restored, tracked and hashed through the same serializer and
 * registry path as every other game object. Nothing holds a ref to it, so `alwaysTrackState` keeps the
 * snapshot cull from dropping it.
 *
 * This class is storage only. Rule checks (the Faux Suns format guard, non-negative counters) live on `Game`'s
 * accessors: the generated deserializer writes every field of every game on each restore, so a guard on
 * these setters would throw in every non-Faux-Suns rollback. Writes reach the delta tracker through the
 * decorators, so no field here records a change by hand.
 */
@registerState()
export class GameState extends GameObjectBase {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    @stateRef() public accessor initialFirstPlayer: Player | null = null;
    @stateRef() public accessor initiativePlayer: Player | null = null;
    @stateRef() public accessor actionPhaseActivePlayer: Player | null = null;
    @statePrimitive() public accessor roundNumber = 0;
    @statePrimitive() public accessor isInitiativeClaimed = false;
    @statePrimitive() public accessor isPlanCounterClaimed = false;
    @statePrimitive() public accessor isBlastCounterClaimed = false;
    @stateRef() public accessor planCounterClaimedByPlayer: Player | null = null;
    @stateRef() public accessor blastCounterClaimedByPlayer: Player | null = null;
    @stateArray() public accessor allCards: GameObjectId<Card>[] = [];
    @statePrimitive() public accessor actionNumber = 0;
    @stateArray() public accessor winnerNames: string[] = [];
    @statePrimitive() public accessor lastGameEventId = 0;
    @statePrimitive() public accessor currentPhase: PhaseName | null = null;
    @statePrimitive() public accessor prevActionPhasePlayerPassed: boolean | null = null;
    @stateArray() public accessor movedCards: GameObjectId<Card>[] = [];

    public constructor(game: Game) {
        super(game);
    }

    public override getGameObjectName(): string {
        return 'GameState';
    }
}
