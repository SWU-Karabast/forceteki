import type { Card } from '../../card/Card';
import type { PhaseName } from '../../Constants';
import type Game from '../../Game';
import * as Helpers from '../../utils/Helpers';
import * as Contract from '../../utils/Contract';
import type { GameObjectRef, IGameObjectBaseState } from '../../GameObjectBase';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export interface IAdditionalPhaseState extends IGameObjectBaseState {
    phaseStartedForRounds: Set<number>;
    phaseEndedForRounds: Set<number>;
    source: GameObjectRef<Card>;
}

export class AdditionalPhase extends OngoingEffectValueWrapper<AdditionalPhase, IAdditionalPhaseState> {
    public readonly phase: PhaseName;

    public constructor(game: Game, phase: PhaseName) {
        const effectDescription = `grant an additional ${Helpers.capitalize(phase)} phase after the first one each round`;
        super(game, null, effectDescription);
        this.phase = phase;
    }

    public override getValue() {
        return this;
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);

        super.setContext(context);

        this.state.source = this.context.source.getRef();
    }

    protected override setupDefaultState(): void {
        this.state.phaseStartedForRounds = new Set<number>();
        this.state.phaseEndedForRounds = new Set<number>();
    }

    public markAdditionalPhaseStarted(roundNumber: number): void {
        Contract.assertFalse(this.hasStartedPhaseThisRound(roundNumber), 'Additional phase has already started this round');
        this.state.phaseStartedForRounds.add(roundNumber);
    }

    public hasStartedPhaseThisRound(roundNumber: number): boolean {
        return this.state.phaseStartedForRounds.has(roundNumber);
    }

    public markAdditionalPhaseEnded(roundNumber: number): void {
        Contract.assertFalse(this.hasEndedPhaseThisRound(roundNumber), 'Additional phase has already ended this round');
        this.state.phaseEndedForRounds.add(roundNumber);
    }

    public hasEndedPhaseThisRound(roundNumber: number): boolean {
        return this.state.phaseEndedForRounds.has(roundNumber);
    }

    public override isAdditionalPhase(): this is AdditionalPhase {
        return true;
    }
}
