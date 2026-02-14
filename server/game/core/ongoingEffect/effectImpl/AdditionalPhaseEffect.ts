import type { Card } from '../../card/Card';
import type { PhaseName } from '../../Constants';
import type Game from '../../Game';
import * as Helpers from '../../utils/Helpers';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import { registerState, undoObject, undoPlainState } from '../../GameObjectUtils';

@registerState()
export class AdditionalPhaseEffect extends OngoingEffectValueWrapper<AdditionalPhaseEffect> {
    public readonly phase: PhaseName;

    @undoPlainState()
    private accessor _phaseStartedForRounds: Set<number> = new Set<number>();

    @undoPlainState()
    private accessor _phaseEndedForRounds: Set<number> = new Set<number>();

    @undoObject()
    private accessor _source: Card | null = null;

    public get source(): Card {
        return this._source;
    }

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

        this._source = this.context.source;
    }

    public markAdditionalPhaseStarted(roundNumber: number): void {
        Contract.assertFalse(this.hasStartedPhaseThisRound(roundNumber), 'Additional phase has already started this round');
        this._phaseStartedForRounds.add(roundNumber);
    }

    public hasStartedPhaseThisRound(roundNumber: number): boolean {
        return this._phaseStartedForRounds.has(roundNumber);
    }

    public markAdditionalPhaseEnded(roundNumber: number): void {
        Contract.assertFalse(this.hasEndedPhaseThisRound(roundNumber), 'Additional phase has already ended this round');
        this._phaseEndedForRounds.add(roundNumber);
    }

    public hasEndedPhaseThisRound(roundNumber: number): boolean {
        return this._phaseEndedForRounds.has(roundNumber);
    }

    public override isAdditionalPhase(): this is AdditionalPhaseEffect {
        return true;
    }
}
