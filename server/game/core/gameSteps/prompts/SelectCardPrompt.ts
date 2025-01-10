import { AbilityContext } from '../../ability/AbilityContext';
import type { Card } from '../../card/Card';
import type BaseCardSelector from '../../cardSelector/BaseCardSelector';
import CardSelectorFactory from '../../cardSelector/CardSelectorFactory';
import type Game from '../../Game';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { ISelectCardPromptProperties } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

/**
 * General purpose prompt that asks the user to select 1 or more cards.
 *
 * The properties option object has the following properties:
 * numCards           - an integer specifying the number of cards the player
 *                      must select. Set to 0 if there is no limit on the num
 *                      of cards that can be selected.
 * availableCards     - one more Card objects indicating the base set of legal
 *                      targets for selection. The cardCondition filter will still
 *                      be applied to this list, if provided.
 * multiSelect        - boolean that ensures that the selected cards are sent as
 *                      an array, even if the numCards limit is 1.
 * buttons            - array of buttons for the prompt.
 * activePromptTitle  - the title that should be used in the prompt for the
 *                      choosing player.
 * waitingPromptTitle - the title that should be used in the prompt for the
 *                      opponent players.
 * maxStat            - a function that returns the maximum value that cards
 *                      selected by the prompt cannot exceed. If not specified,
 *                      then no stat limiting is done on the prompt.
 * cardStat           - a function that takes a card and returns a stat value.
 *                      Used for prompts that have a maximum stat value.
 * cardCondition      - a function that takes a card and should return a boolean
 *                      on whether that card is elligible to be selected.
 * cardType           - a string or array of strings listing which types of
 *                      cards can be selected. Defaults to the list of draw
 *                      card types.
 * onSelect           - a callback that is called once all cards have been
 *                      selected. On single card prompts this is called as soon
 *                      as an elligible card is clicked. On multi-select prompts
 *                      it is called when the done button is clicked. If the
 *                      callback does not return true, the prompt is not marked
 *                      as complete.
 * onMenuCommand      - a callback that is called when one of the additional
 *                      buttons is clicked.
 * onCancel           - a callback that is called when the player clicks the
 *                      done button without selecting any cards.
 * source             - what is at the origin of the user prompt, usually a card;
 *                      used to provide a default waitingPromptTitle, if missing
 * gameSystem         - a GameSystem object representing the game effect to be checked on
 *                      target cards.
 * selectOrder        - an optional boolean indicating whether or not to display
 *                      the order of the selection during the prompt.
 * mustSelect         - an array of cards which must be selected
 */
export class SelectCardPrompt extends UiPrompt {
    private readonly cannotUnselectMustSelect: boolean = false;
    private readonly choosingPlayer: Player;
    private readonly context: AbilityContext;
    private readonly hideIfNoLegalTargets: boolean;
    private readonly onlyMustSelectMayBeChosen: boolean = false;
    private readonly promptTitle: string;
    private readonly properties: ISelectCardPromptProperties;
    private readonly selector: BaseCardSelector;
    private readonly source: OngoingEffectSource;

    private previouslySelectedCards?: Card[];
    private selectedCards: Card[];

    public constructor(game: Game, choosingPlayer: Player, properties: ISelectCardPromptProperties) {
        super(game);

        this.choosingPlayer = choosingPlayer;
        if (typeof properties.source === 'string') {
            properties.source = new OngoingEffectSource(game, properties.source);
        } else if (properties.context && properties.context.source) {
            properties.source = properties.context.source;
        }

        if (!properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to use ' + properties.source.name;
        }

        this.source = properties.source;

        this.properties = properties;
        this.context = properties.context || new AbilityContext({ game: game, player: choosingPlayer, source: properties.source });
        this.properties = Object.assign(this.defaultProperties(), properties);
        if (properties.immediateEffect) {
            const cardCondition = this.properties.cardCondition;
            this.properties.cardCondition = (card, context) =>
                cardCondition(card, context) && this.properties.immediateEffect.canAffect(card, context);
        }
        this.hideIfNoLegalTargets = !!properties.hideIfNoLegalTargets;

        this.selector = properties.selector || CardSelectorFactory.create(this.properties);

        this.selectedCards = [];
        if (properties.mustSelect && properties.mustSelect.length > 0) {
            Contract.assertHasProperty(this.selector, 'numCards');

            if (this.selector.hasEnoughSelected(properties.mustSelect, properties.context) && this.selector.numCards > 0 && properties.mustSelect.length >= this.selector.numCards) {
                this.onlyMustSelectMayBeChosen = true;
            } else {
                this.selectedCards = [...properties.mustSelect];
                this.cannotUnselectMustSelect = true;
            }
        }

        this.promptTitle = properties.promptTitle || this.source.name;

        this.savePreviouslySelectedCards();
    }

    private defaultProperties() {
        return {
            buttons: [],
            selectCard: true,
            cardCondition: () => true,
            onSelect: () => true,
            onMenuCommand: () => true,
            onCancel: () => undefined,
            hideIfNoLegalTargets: false
        };
    }

    private savePreviouslySelectedCards() {
        this.previouslySelectedCards = this.choosingPlayer.selectedCards;
        this.choosingPlayer.clearSelectedCards();
        this.choosingPlayer.setSelectedCards(this.selectedCards);
    }

    public override continue() {
        if (this.hideIfNoLegalTargets && this.selector.optional && !this.selector.hasEnoughTargets(this.context, this.choosingPlayer)) {
            this.complete();
        }

        if (!this.isComplete()) {
            this.highlightSelectableCards();
        }

        return super.continue();
    }

    private highlightSelectableCards() {
        this.choosingPlayer.setSelectableCards(this.selector.findPossibleCards(this.context).filter((card) => this.checkCardCondition(card)));
    }

    public override activeCondition(player) {
        return player === this.choosingPlayer;
    }

    public override activePrompt() {
        let buttons = this.properties.buttons;
        if (!this.selector.automaticFireOnSelect(this.context) && this.selector.hasEnoughSelected(this.selectedCards, this.context) || this.selector.optional) {
            if (buttons.every((button) => button.arg !== 'done')) {
                buttons = [{ text: 'Done', arg: 'done' }].concat(buttons);
            }
        }

        return {
            selectCard: this.properties.selectCard,
            selectOrder: this.properties.selectOrder,
            menuTitle: this.properties.activePromptTitle || this.selector.defaultActivePromptTitle(this.context),
            buttons: buttons,
            promptTitle: this.promptTitle,
            promptUuid: this.uuid
        };
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }

    public override onCardClicked(player, card) {
        if (player !== this.choosingPlayer) {
            return false;
        }

        if (!this.checkCardCondition(card)) {
            return false;
        }

        if (!this.selectCard(card)) {
            return false;
        }

        if (this.selector.automaticFireOnSelect(this.context) && this.selector.hasReachedLimit(this.selectedCards, this.context)) {
            return this.fireOnSelect();
        }

        return true;
    }

    private checkCardCondition(card) {
        if (this.onlyMustSelectMayBeChosen && !this.properties.mustSelect.includes(card)) {
            return false;
        } else if (this.selectedCards.includes(card)) {
            return true;
        }

        return (
            this.selector.canTarget(card, this.context, this.choosingPlayer, this.selectedCards) &&
            !this.selector.wouldExceedLimit(this.selectedCards, card)
        );
    }

    private selectCard(card) {
        if (this.selector.hasReachedLimit(this.selectedCards, this.context) && !this.selectedCards.includes(card)) {
            return false;
        } else if (this.cannotUnselectMustSelect && this.properties.mustSelect.includes(card)) {
            return false;
        }

        if (!this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
        } else {
            this.selectedCards = this.selectedCards.filter((c) => c !== card);
        }
        this.choosingPlayer.setSelectedCards(this.selectedCards);

        return true;
    }

    private fireOnSelect() {
        const cardParam = this.selector.formatSelectParam(this.selectedCards);
        if (this.properties.onSelect(cardParam)) {
            this.complete();
            return true;
        }
        this.clearSelection();
        return false;
    }

    public override menuCommand(player, arg) {
        if (arg === 'cancel') {
            this.properties.onCancel(player);
            this.complete();
            return true;
        } else if (arg === 'done' && this.selector.hasEnoughSelected(this.selectedCards, this.context)) {
            return this.fireOnSelect();
        } else if (this.properties.onMenuCommand(arg)) {
            this.complete();
            return true;
        }
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override complete() {
        this.clearSelection();
        return super.complete();
    }

    private clearSelection() {
        this.selectedCards = [];
        this.choosingPlayer.clearSelectedCards();
        this.choosingPlayer.clearSelectableCards();

        // Restore previous selections.
        this.choosingPlayer.setSelectedCards(this.previouslySelectedCards);
    }
}
