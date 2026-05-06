import { AllPlayerPrompt } from './AllPlayerPrompt';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import type { Game } from '../../Game';
import { Contract } from '../../utils/Contract';
import { Helpers } from '../../utils/Helpers';
import { DeckZoneDestination, EffectName } from '../../Constants';
import { TriggerHandlingMode } from '../../event/EventWindow';
import { DrawSystem } from '../../../gameSystems/DrawSystem';
import { ShuffleDeckSystem } from '../../../gameSystems/ShuffleDeckSystem';
import { MoveCardSystem } from '../../../gameSystems/MoveCardSystem';

export class MulliganPrompt extends AllPlayerPrompt {
    protected playersDone = new Map<string, boolean>();
    protected playerMulligan = new Map<string, boolean>();
    public constructor(game: Game) {
        super(game);
        for (const player of game.getPlayers()) {
            this.playersDone[player.name] = false;
            this.playerMulligan[player.name] = false;
        }
    }

    public override completionCondition(player): boolean {
        if (player.base.hasOngoingEffect(EffectName.NoMulligan)) {
            this.playersDone[player.name] = true;
        }
        return this.playersDone[player.name];
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Choose whether to mulligan or keep your hand',
            buttons: [{ text: 'Mulligan', arg: 'mulligan' }, { text: 'Keep', arg: 'keep' }],
            promptTitle: 'Mulligan Step',
            promptUuid: this.uuid
        };
    }

    public override waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose whether to mulligan'
        };
    }

    public override continue() {
        if (this.isComplete()) {
            this.complete();
        }
        return super.continue();
    }

    public override menuCommand(player, arg): boolean {
        if (arg === 'mulligan') {
            if (this.completionCondition(player)) {
                return false;
            }
            this.game.addMessage('{0} will mulligan', player);
            this.playersDone[player.name] = true;
            this.playerMulligan[player.name] = true;
            return true;
        } else if (arg === 'keep') {
            this.game.addMessage('{0} will keep their hand', player);
            this.playersDone[player.name] = true;
            return true;
        }
        // in the case the command comes as an invalid one
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override complete() {
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
