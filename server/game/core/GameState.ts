import type { Card } from './card/Card';
import type { PhaseName } from './Constants';
import type { Game } from './Game';
import { GameObjectBase } from './GameObjectBase';
import { registerState, statePrimitive, stateRef, stateRefArray, stateValue } from './GameObjectUtils';
import type { Player } from './Player';

@registerState()
export class GameState extends GameObjectBase {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get alwaysTrackState(): boolean {
        return true;
    }

    @stateRef()
    private accessor _initialFirstPlayer: Player | null = null;

    @stateRef()
    private accessor _initiativePlayer: Player | null = null;

    @stateRef()
    private accessor _actionPhaseActivePlayer: Player | null = null;

    @statePrimitive()
    private accessor _roundNumber = 0;

    @statePrimitive()
    private accessor _isInitiativeClaimed = false;

    @stateRefArray(false)
    private accessor _allCards: Card[] = [];

    @statePrimitive()
    private accessor _actionNumber = 0;

    @stateValue()
    private accessor _winnerNames: string[] = [];

    @statePrimitive()
    private accessor _lastGameEventId = 0;

    @statePrimitive()
    private accessor _currentPhase: PhaseName | null = null;

    @statePrimitive()
    private accessor _prevActionPhasePlayerPassed: boolean | null = null;

    @stateRefArray(false)
    private accessor _movedCards: Card[] = [];

    public constructor(game: Game) {
        super(game);
    }

    public override getGameObjectName(): string {
        return 'GameState';
    }

    public get initialFirstPlayer(): Player | null {
        return this._initialFirstPlayer;
    }

    public set initialFirstPlayer(value: Player | null) {
        this._initialFirstPlayer = value;
    }

    public get initiativePlayer(): Player | null {
        return this._initiativePlayer;
    }

    public set initiativePlayer(value: Player | null) {
        this._initiativePlayer = value;
    }

    public get actionPhaseActivePlayer(): Player | null {
        return this._actionPhaseActivePlayer;
    }

    public set actionPhaseActivePlayer(value: Player | null) {
        this._actionPhaseActivePlayer = value;
    }

    public get roundNumber(): number {
        return this._roundNumber;
    }

    public set roundNumber(value: number) {
        this._roundNumber = value;
    }

    public get isInitiativeClaimed(): boolean {
        return this._isInitiativeClaimed;
    }

    public set isInitiativeClaimed(value: boolean) {
        this._isInitiativeClaimed = value;
    }

    public get allCards(): Card[] {
        return this._allCards;
    }

    public set allCards(value: Card[]) {
        this._allCards = value;
    }

    public get actionNumber(): number {
        return this._actionNumber;
    }

    public set actionNumber(value: number) {
        this._actionNumber = value;
    }

    public get winnerNames(): readonly string[] {
        return this._winnerNames;
    }

    public addWinnerName(name: string): void {
        this.game.deltaTracker?.recordFieldChange(this, '_winnerNames');
        this._winnerNames = this._winnerNames.concat(name);
    }

    public get lastGameEventId(): number {
        return this._lastGameEventId;
    }

    public incrementLastGameEventId(): number {
        this.game.deltaTracker?.recordFieldChange(this, '_lastGameEventId');
        this._lastGameEventId += 1;
        return this._lastGameEventId;
    }

    public get currentPhase(): PhaseName | null {
        return this._currentPhase;
    }

    public set currentPhase(value: PhaseName | null) {
        this._currentPhase = value;
    }

    public get prevActionPhasePlayerPassed(): boolean | null {
        return this._prevActionPhasePlayerPassed;
    }

    public set prevActionPhasePlayerPassed(value: boolean | null) {
        this._prevActionPhasePlayerPassed = value;
    }

    public get movedCards(): Card[] {
        return this._movedCards;
    }

    public set movedCards(value: Card[]) {
        this._movedCards = value;
    }

    public clearMovedCards(): void {
        this.game.deltaTracker?.recordFieldChange(this, '_movedCards');
        this._movedCards = [];
    }
}