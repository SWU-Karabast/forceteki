import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { Contract } from '../../utils/Contract';
import { AllPlayerPrompt } from './AllPlayerPrompt';
import { OpponentResourceChoice, PromptType, SelectCardMode } from '../PromptInterfaces';
import { GameCardMetric } from '../../../../gameStatistics/GameStatisticsTracker';
import { EventName } from '../../Constants';
import { GameEvent } from '../../event/GameEvent';
import { TriggerHandlingMode } from '../../event/EventWindow';

export interface IResourcePromptOptions {
    resetActionTimerOnComplete?: boolean;

    /**
     * The player with the initiative chooses first, as in the regroup phase. Both players still choose at the same time,
     * but the player without the initiative is shown what the player with it has confirmed (whether they resourced a card,
     * never which one), and their action timer does not run until then, so they can wait for it.
     */
    initiativePlayerChoosesFirst?: boolean;
}

const OpponentResourceChoiceText: Record<OpponentResourceChoice, string> = {
    [OpponentResourceChoice.NotChosen]: 'Your opponent has not chosen yet',
    [OpponentResourceChoice.Resourced]: 'Your opponent has resourced a card',
    [OpponentResourceChoice.Passed]: 'Your opponent has passed resourcing',
};

export class ResourcePrompt extends AllPlayerPrompt {
    private readonly nCardsToResource: number;
    private readonly initiativePlayerChoosesFirst: boolean;

    protected selectedCards = new Map<string, Card[]>();
    protected selectableCards = new Map<string, Card[]>();
    protected playersDone = new Map<string, boolean>();

    public constructor(
        game: Game,
        nCardsToResource: number,
        options: IResourcePromptOptions = {}
    ) {
        super(game, options.resetActionTimerOnComplete ?? false);

        this.nCardsToResource = nCardsToResource;
        this.initiativePlayerChoosesFirst = options.initiativePlayerChoosesFirst ?? false;

        if (this.initiativePlayerChoosesFirst) {
            Contract.assertNotNullLike(game.initiativePlayer, 'A resource prompt where the initiative player chooses first needs a player with the initiative');
        }

        for (const player of game.getPlayers()) {
            this.selectedCards[player.name] = [];
            this.playersDone[player.name] = false;
        }
    }

    public override completionCondition(player: Player) {
        return this.playersDone[player.name];
    }

    public override continue() {
        if (!this.isComplete()) {
            this.highlightSelectableCards();
        } else {
            this.complete();
        }

        return super.continue();
    }

    protected override highlightSelectableCards() {
        this.game.getPlayers().forEach((player) => {
            // cards are only selectable until we've selected as many as allowed
            if (!this.selectableCards[player.name] && !this.completionCondition(player)) {
                this.selectableCards[player.name] = player.hand;
            } else if (this.completionCondition(player)) {
                this.selectableCards[player.name] = [];
            }
            player.setSelectableCards(this.selectableCards[player.name]);
        });
    }

    public override activePrompt(player: Player): IPlayerPromptStateProperties {
        const prompt = super.activePrompt(player);

        if (!this.isWaitingOnInitiativePlayerFor(player)) {
            return prompt;
        }

        const opponentResourceChoice = this.initiativePlayerChoice();
        return {
            ...prompt,
            promptDescription: OpponentResourceChoiceText[opponentResourceChoice],
            opponentResourceChoice,
        };
    }

    public override hasShownChoiceToOpponent(player: Player): boolean {
        return this.initiativePlayerChoosesFirst &&
          player === this.game.initiativePlayer &&
          this.completionCondition(player) &&
          !this.completionCondition(player.opponent);
    }

    protected override actionTimerRuns(player: Player): boolean {
        return !this.isWaitingOnInitiativePlayerFor(player) || this.completionCondition(this.game.initiativePlayer);
    }

    /** Whether `player` chooses after the player with the initiative, so is shown what that player has chosen. */
    private isWaitingOnInitiativePlayerFor(player: Player): boolean {
        return this.initiativePlayerChoosesFirst && player !== this.game.initiativePlayer;
    }

    private initiativePlayerChoice(): OpponentResourceChoice {
        const initiativePlayer = this.game.initiativePlayer;

        if (!this.completionCondition(initiativePlayer)) {
            return OpponentResourceChoice.NotChosen;
        }

        return this.selectedCards[initiativePlayer.name].length > 0
            ? OpponentResourceChoice.Resourced
            : OpponentResourceChoice.Passed;
    }

    public override activePromptInternal(player: Player): IPlayerPromptStateProperties {
        let promptText = null;
        const selectedCount = this.selectedCards[player.name].length;
        const selectCardMode = this.nCardsToResource === 1 ? SelectCardMode.Single : SelectCardMode.Multiple;

        if (this.nCardsToResource !== 1) {
            promptText = `Select ${this.nCardsToResource} cards to resource`;
        } else {
            promptText = 'Select 1 card to resource';
        }

        const hasEnoughSelected = this.hasEnoughSelected(player);

        return {
            selectCardMode,
            menuTitle: promptText,
            buttons: [{
                text: selectedCount === 0 && selectCardMode === SelectCardMode.Single ? 'Skip Resourcing' : 'Confirm Resources',
                arg: 'done',
                disabled: !hasEnoughSelected,
            }],
            promptTitle: 'Resource Step',
            promptUuid: this.uuid,
            promptType: PromptType.Resource
        };
    }

    public override onCardClicked(player: Player, card: Card) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(card);

        if (
            !this.activeCondition(player) || !player.handZone.hasCard(card)
        ) {
            return false;
        }

        if (!this.selectedCards[player.name].includes(card)) {
            if (this.selectedCards[player.name].length === this.nCardsToResource) {
                return false;
            }

            this.selectedCards[player.name].push(card);
        } else {
            this.selectedCards[player.name] = this.selectedCards[player.name].filter((c) => c !== card);
        }

        player.setSelectedCards(this.selectedCards[player.name]);
        return true;
    }

    public override waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose cards to resource',
            promptType: PromptType.Resource,
        };
    }

    public override menuCommand(player: Player, arg: string): boolean {
        if (arg === 'done') {
            if (this.completionCondition(player)) {
                return false;
            }
            if (!this.hasEnoughSelected(player)) {
                return false;
            }
            this.playersDone[player.name] = true;
            return true;
        }
        // in the case the command comes as an invalid one
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    protected hasEnoughSelected(player: Player): boolean {
        return this.selectedCards[player.name].length === this.nCardsToResource;
    }

    protected resourceSelectedCards(player: Player) {
        const cards = this.selectedCards[player.name];

        if (cards.length > 0) {
            const events = cards.map((card) => new GameEvent(
                EventName.OnCardResourced,
                this.game.getFrameworkContext(player),
                { card, resourceControllingPlayer: player },
                () => {
                    player.resourceCard(card, false);
                    this.game.statsTracker.trackCardMetric(GameCardMetric.Resourced, card, player);
                }
            ));

            this.game.openEventWindow(events, TriggerHandlingMode.ResolvesTriggers);
            this.game.addMessage('{0} has resourced {1} {2} from hand', player, cards.length, cards.length === 1 ? 'card' : 'cards');
        } else {
            this.game.addMessage('{0} has not resourced any cards', player);
        }
    }

    public override complete() {
        // the player with the initiative resources first, so their card and anything it triggers resolve before their opponent's
        this.game.getPlayersInInitiativeOrder().forEach((player) => this.resourceSelectedCards(player));

        return super.complete();
    }
}
