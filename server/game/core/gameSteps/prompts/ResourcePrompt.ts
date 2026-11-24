import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { Contract } from '../../utils/Contract';
import { InitiativePlayerFirstPrompt } from './InitiativePlayerFirstPrompt';
import type { IInitiativePlayerFirstPromptOptions } from './InitiativePlayerFirstPrompt';
import { OpponentResourceChoice, PromptType, SelectCardMode } from '../PromptInterfaces';
import { GameCardMetric } from '../../../../gameStatistics/GameStatisticsTracker';
import { EventName } from '../../Constants';
import { GameEvent } from '../../event/GameEvent';
import { TriggerHandlingMode } from '../../event/EventWindow';

export type IResourcePromptOptions = IInitiativePlayerFirstPromptOptions;

/** The `arg` of the button a player confirms their resources with. */
export enum ResourcePromptButtonArg {
    Done = 'done',
}

export class ResourcePrompt extends InitiativePlayerFirstPrompt {
    private readonly nCardsToResource: number;

    protected selectedCards = new Map<string, Card[]>();
    protected selectableCards = new Map<string, Card[]>();

    public constructor(
        game: Game,
        nCardsToResource: number,
        options: IResourcePromptOptions = {}
    ) {
        super(game, options);

        this.nCardsToResource = nCardsToResource;

        for (const player of game.getPlayers()) {
            this.selectedCards[player.name] = [];
        }
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
            // a player's hand is selectable until they confirm, and again if they cancel what they confirmed
            this.selectableCards[player.name] = this.completionCondition(player) ? [] : player.hand;
            player.setSelectableCards(this.selectableCards[player.name]);
            // a player who has confirmed keeps the cards they chose shown as selected while they wait for their opponent
            player.setSelectedCards(this.selectedCards[player.name]);
        });
    }

    protected override initiativePlayerChoiceProperties(): Partial<IPlayerPromptStateProperties> {
        const initiativePlayer = this.game.initiativePlayer;

        if (!this.initiativePlayerHasChosen()) {
            return {
                promptDescription: 'Your opponent has not chosen yet',
                opponentResourceChoice: OpponentResourceChoice.NotChosen,
            };
        }

        const count = this.selectedCards[initiativePlayer.name].length;
        if (count === 0) {
            return {
                promptDescription: 'Your opponent has passed resourcing',
                opponentResourceChoice: OpponentResourceChoice.Passed,
            };
        }

        return {
            promptDescription: `Your opponent has resourced ${count === 1 ? 'a card' : `${count} cards`}`,
            opponentResourceChoice: OpponentResourceChoice.Resourced,
        };
    }

    protected override waitingForInitiativePlayerProperties() {
        // The prompt stays the resource prompt, with the cards they chose still selected (`highlightSelectableCards` keeps
        // them), until the player with the initiative has chosen and both resource together.
        return {
            menuTitle: 'Waiting for opponent to resource',
            promptType: PromptType.Resource,
            // the client keeps a prompt with a card selection mode in the action tray rather than in a popup
            selectCardMode: SelectCardMode.Multiple,
        };
    }

    protected override waitingForOpponentPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose cards to resource',
            promptType: PromptType.Resource,
        };
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
                arg: ResourcePromptButtonArg.Done,
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

    public override menuCommand(player: Player, arg: string): boolean {
        if (arg === ResourcePromptButtonArg.Done) {
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
