import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { Contract } from '../../utils/Contract';
import { AllPlayerPrompt } from './AllPlayerPrompt';

export interface IInitiativePlayerFirstPromptOptions {
    resetActionTimerOnComplete?: boolean;

    /**
     * The player with the initiative chooses first, as in the mulligan and the regroup phase's resource step. Both players still
     * choose at the same time, but the player without the initiative is shown what the player with it has confirmed, and
     * their action timer does not run until then, so they can wait for it. If they confirm first, they are shown that they
     * are waiting, and can cancel their choice until the player with the initiative has chosen.
     */
    initiativePlayerChoosesFirst?: boolean;
}

/** The `arg` of the buttons shown to the player without the initiative while they wait on the player with it. */
export enum WaitingForInitiativePlayerButtonArg {
    Waiting = 'waiting',
    Cancel = 'cancel',
}

/**
 * A prompt that waits on both players, each making one choice, where the player with the initiative may choose first
 * ({@link IInitiativePlayerFirstPromptOptions.initiativePlayerChoosesFirst}). A subclass sets `playersDone` when a player
 * confirms their choice, and supplies how the choice of the player with the initiative is shown to their opponent.
 */
export abstract class InitiativePlayerFirstPrompt extends AllPlayerPrompt {
    private readonly initiativePlayerChoosesFirst: boolean;

    protected playersDone = new Map<string, boolean>();

    public constructor(game: Game, options: IInitiativePlayerFirstPromptOptions = {}) {
        super(game, options.resetActionTimerOnComplete ?? false);

        this.initiativePlayerChoosesFirst = options.initiativePlayerChoosesFirst ?? false;

        for (const player of game.getPlayers()) {
            this.playersDone[player.name] = false;
        }
    }

    /**
     * What the player with the initiative has chosen so far, added to the prompt of the player without it while they
     * choose: a description of it and the prompt state field the client reads it from.
     */
    protected abstract initiativePlayerChoiceProperties(): Partial<IPlayerPromptStateProperties>;

    /** The prompt of the player without the initiative once they have chosen, apart from its buttons. */
    protected abstract waitingForInitiativePlayerProperties(): Omit<IPlayerPromptStateProperties, 'buttons' | 'promptUuid'>;

    /** The prompt of a player who has chosen and waits on their opponent, in any other case. */
    protected abstract waitingForOpponentPrompt(): Omit<IPlayerPromptStateProperties, 'promptUuid'>;

    public override completionCondition(player: Player): boolean {
        return this.playersDone[player.name];
    }

    public override continue(): boolean {
        if (this.initiativePlayerChoosesFirst) {
            Contract.assertNotNullLike(this.game.initiativePlayer, 'A prompt where the initiative player chooses first needs a player with the initiative');
        }

        return super.continue();
    }

    public override activePrompt(player: Player): IPlayerPromptStateProperties {
        const prompt = super.activePrompt(player);

        if (!this.isWaitingOnInitiativePlayerFor(player)) {
            return prompt;
        }

        return { ...prompt, ...this.initiativePlayerChoiceProperties() };
    }

    public override waitingPrompt(player: Player) {
        if (!this.isWaitingOnInitiativePlayerFor(player)) {
            return this.waitingForOpponentPrompt();
        }

        // The player without the initiative has confirmed before the player with it. They are shown that they are waiting
        // on the player with the initiative, and can cancel their choice until that player has chosen.
        const waitingButton = { text: 'Waiting', arg: WaitingForInitiativePlayerButtonArg.Waiting, disabled: true };
        return this.addButtonDefaultsToPrompt({
            ...this.waitingForInitiativePlayerProperties(),
            // the client draws the buttons in this order, Cancel to the left of Waiting
            buttons: this.canCancelChoice(player)
                ? [{ text: 'Cancel', arg: WaitingForInitiativePlayerButtonArg.Cancel }, waitingButton]
                : [waitingButton],
            promptUuid: this.uuid,
        });
    }

    public override onMenuCommand(player: Player, arg: string, uuid: string, method: string): boolean {
        // Cancel comes from a player the prompt is no longer waiting on, which the usual path refuses, so it is handled here
        if (arg === WaitingForInitiativePlayerButtonArg.Cancel) {
            return this.cancelChoice(player, uuid);
        }

        return super.onMenuCommand(player, arg, uuid, method);
    }

    public override hasShownChoiceToOpponent(player: Player): boolean {
        return this.initiativePlayerChoosesFirst &&
          player === this.game.initiativePlayer &&
          this.completionCondition(player) &&
          !this.completionCondition(player.opponent);
    }

    protected override actionTimerRuns(player: Player): boolean {
        return !this.isWaitingOnInitiativePlayerFor(player) || this.initiativePlayerHasChosen();
    }

    /** Whether `player` chooses after the player with the initiative, so is shown what that player has chosen. */
    protected isWaitingOnInitiativePlayerFor(player: Player): boolean {
        return this.initiativePlayerChoosesFirst && player !== this.game.initiativePlayer;
    }

    protected initiativePlayerHasChosen(): boolean {
        return this.completionCondition(this.game.initiativePlayer);
    }

    /**
     * Whether `player`, who has chosen before the player with the initiative, may take their choice back. A subclass
     * refuses it for a player whose choice was made for them.
     */
    protected canCancelChoice(player: Player): boolean {
        return this.isWaitingOnInitiativePlayerFor(player) &&
          this.completionCondition(player) &&
          !this.initiativePlayerHasChosen();
    }

    /**
     * Takes back the choice of the player without the initiative, who confirmed before the player with it, so they choose
     * again. Their opponent is shown nothing of it, as they were shown nothing of the choice. Returns false, changing
     * nothing, for a cancel that does not apply.
     */
    private cancelChoice(player: Player, uuid: string): boolean {
        if (uuid !== this.uuid || !this.canCancelChoice(player)) {
            return false;
        }

        this.playersDone[player.name] = false;
        return true;
    }
}
