import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import type { Game } from '../../Game';
import type { Player } from '../../Player';
import { Contract } from '../../utils/Contract';
import { Helpers } from '../../utils/Helpers';
import { DeckZoneDestination, EffectName } from '../../Constants';
import { TriggerHandlingMode } from '../../event/EventWindow';
import { DrawSystem } from '../../../gameSystems/DrawSystem';
import { ShuffleDeckSystem } from '../../../gameSystems/ShuffleDeckSystem';
import { MoveCardSystem } from '../../../gameSystems/MoveCardSystem';
import { OpponentMulliganChoice } from '../PromptInterfaces';
import { InitiativePlayerFirstPrompt } from './InitiativePlayerFirstPrompt';
import type { IInitiativePlayerFirstPromptOptions } from './InitiativePlayerFirstPrompt';

/** The `arg` of each of the mulligan's choices. */
export enum MulliganPromptButtonArg {
    Mulligan = 'mulligan',
    Keep = 'keep',
}

export class MulliganPrompt extends InitiativePlayerFirstPrompt {
    protected playerMulligan = new Map<string, boolean>();

    public constructor(game: Game, options: Omit<IInitiativePlayerFirstPromptOptions, 'resetActionTimerOnComplete'> = {}) {
        super(game, { ...options, resetActionTimerOnComplete: true });

        for (const player of game.getPlayers()) {
            this.playerMulligan[player.name] = false;
        }
    }

    public override completionCondition(player: Player): boolean {
        if (this.cannotMulligan(player)) {
            this.playersDone[player.name] = true;
        }
        return super.completionCondition(player);
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Choose whether to mulligan or keep your hand',
            buttons: [{ text: 'Mulligan', arg: MulliganPromptButtonArg.Mulligan }, { text: 'Keep', arg: MulliganPromptButtonArg.Keep }],
            promptTitle: 'Mulligan Step',
            promptUuid: this.uuid
        };
    }

    protected override initiativePlayerChoiceProperties(): Partial<IPlayerPromptStateProperties> {
        if (!this.initiativePlayerHasChosen()) {
            return {
                promptDescription: 'Your opponent has not chosen yet',
                opponentMulliganChoice: OpponentMulliganChoice.NotChosen,
            };
        }

        return this.playerMulligan[this.game.initiativePlayer.name]
            ? { promptDescription: 'Your opponent has taken a mulligan', opponentMulliganChoice: OpponentMulliganChoice.Mulligan }
            : { promptDescription: 'Your opponent has kept their hand', opponentMulliganChoice: OpponentMulliganChoice.Keep };
    }

    protected override waitingForInitiativePlayerProperties() {
        return {
            menuTitle: 'Waiting for opponent to choose whether to mulligan',
        };
    }

    protected override waitingForOpponentPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose whether to mulligan'
        };
    }

    /** A player who cannot mulligan has their choice made for them, so it cannot be cancelled. */
    protected override canCancelChoice(player: Player): boolean {
        return super.canCancelChoice(player) && !this.cannotMulligan(player);
    }

    private cannotMulligan(player: Player): boolean {
        return player.base.hasOngoingEffect(EffectName.NoMulligan);
    }

    public override continue() {
        if (this.isComplete()) {
            this.complete();
        }
        return super.continue();
    }

    public override menuCommand(player: Player, arg: string): boolean {
        if (arg === MulliganPromptButtonArg.Mulligan || arg === MulliganPromptButtonArg.Keep) {
            if (this.completionCondition(player)) {
                return false;
            }
            this.playersDone[player.name] = true;
            this.playerMulligan[player.name] = arg === MulliganPromptButtonArg.Mulligan;
            return true;
        }
        // in the case the command comes as an invalid one
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override complete() {
        // Each choice is announced once both players have chosen, the player with the initiative's first. Announcing one
        // as it is made would show the player with the initiative what their opponent chose before they had chosen.
        for (const player of this.game.getPlayersInInitiativeOrder()) {
            this.game.addMessage(this.playerMulligan[player.name] ? '{0} will mulligan' : '{0} will keep their hand', player);
        }

        for (const player of this.game.getPlayers()) {
            if (this.playerMulligan[player.name]) {
                // Move the first hand to the bottom of the deck
                new MoveCardSystem({
                    target: player.hand,
                    destination: DeckZoneDestination.DeckBottom,
                }).resolve(
                    player,
                    this.game.getFrameworkContext(player),
                    TriggerHandlingMode.ResolvesTriggers
                );


                // Shuffle the deck
                this.game.addMessage('{0} is shuffling their deck', player);
                new ShuffleDeckSystem({ target: player })
                    .resolve(
                        player,
                        this.game.getFrameworkContext(player),
                        TriggerHandlingMode.ResolvesTriggers
                    );


                // Draw a new starting hand
                this.game.addMessage('{0} draws {1} cards in their starting hand', player, player.getStartingHandSize());
                new DrawSystem({ amount: player.getStartingHandSize() })
                    .resolve(
                        player,
                        this.game.getFrameworkContext(player),
                        TriggerHandlingMode.ResolvesTriggers
                    );
            } else {
                // Queue a fake shuffle to ensure the same number of random numbers are generated
                // in this player's slot of the queue, regardless of whether they chose to mulligan.
                // This matters when the game is rolled back to before the mulligan decision and the
                // players make different choices: we want each player's outcome to be independent
                // of their opponent's choice. The step must be queued (not run synchronously) so it
                // executes in the same pipeline order as the real ShuffleDeckSystem above would.
                this.game.queueSimpleStep(
                    () => Helpers.shuffle([
                        ...player.deckZone.getCards(),
                        ...player.hand,
                    ], this.game.randomGenerator),
                    `mulligan keep fake-shuffle for ${player.name}`
                );
            }
        }
        return super.complete();
    }
}
