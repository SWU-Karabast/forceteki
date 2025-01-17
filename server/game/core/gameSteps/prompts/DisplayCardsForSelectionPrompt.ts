import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IButton, IDisplayCard, ISelectableCard } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IDisplayCardsSelectProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsForSelectionPrompt extends DisplayCardPrompt<IDisplayCardsSelectProperties> {
    private static readonly takeNothingButtonText = 'Take nothing';

    private readonly canChooseNothing: boolean;
    private readonly displayCards: ISelectableCard[];
    private readonly doneButton?: IButton;
    private readonly maxCards: number;
    private readonly multiSelectCardCondition: (card: Card, currentlySelectedCards: Card[]) => boolean;
    private readonly selectedCardsHandler: (cards: Card[]) => void;

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsSelectProperties) {
        super(game, choosingPlayer, properties);

        this.maxCards = properties.maxCards || 1;
        this.selectedCardsHandler = properties.selectedCardsHandler;
        this.multiSelectCardCondition = properties.multiSelectCondition || (() => true);

        this.displayCards = properties.displayCards.map((card) => ({
            card,
            // if a card doesn't meet the multi-select condition even when nothing else is selected, we can safely consider it invalid
            selectionState: properties.validCardCondition(card) && this.multiSelectCardCondition(card, [])
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Invalid,
        }));

        this.canChooseNothing = !!properties.canChooseNothing;

        if (this.canChooseNothing) {
            this.doneButton = { text: DisplayCardsForSelectionPrompt.takeNothingButtonText, arg: 'done' };
        } else if (this.maxCards > 1) {
            this.doneButton = { text: 'Done', arg: 'done', disabled: true };
        }
        // if there is only one card to select, the done button is not needed as we'll auto-fire when it's clicked
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptInternal() {
        return {
            buttons: this.doneButton ? [this.doneButton] : [],
        };
    }

    protected override getDisplayCards(): IDisplayCard[] {
        return this.displayCards.map(({ card, selectionState }) => ({
            cardUuid: card.uuid,
            setId: card.setId,
            internalName: card.internalName,
            selectionState
        }));
    }

    public override menuCommand(_player: Player, arg: string, _uuid: string): boolean {
        if (arg === 'done') {
            this.selectedCardsHandler(this.getSelectedCards());
            this.complete();
            return true;
        }

        const selectedCard = this.displayCards.find(({ card }) => card.uuid === arg);
        Contract.assertNotNullLike(selectedCard, `Unexpected menu command: '${arg}'`);

        switch (selectedCard.selectionState) {
            case DisplayCardSelectionState.Selectable:
                // if max cards are already selected, do nothing
                if (this.getSelectedCards().length === this.maxCards) {
                    return false;
                }

                selectedCard.selectionState = DisplayCardSelectionState.Selected;

                if (this.maxCards === 1) {
                    this.selectedCardsHandler([selectedCard.card]);
                    this.complete();
                    return true;
                }

                break;
            case DisplayCardSelectionState.Selected:
                selectedCard.selectionState = DisplayCardSelectionState.Selectable;
                break;
            case DisplayCardSelectionState.Unselectable:
            case DisplayCardSelectionState.Invalid:
                return false;
            default:
                Contract.fail(`Unexpected selection state: '${selectedCard.selectionState}'`);
        }

        this.refreshCardSelectableStatus();
        return false;
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }

    private getSelectedCards(): Card[] {
        return this.displayCards
            .filter((displayCard) => displayCard.selectionState === DisplayCardSelectionState.Selected)
            .map((displayCard) => displayCard.card);
    }

    private refreshCardSelectableStatus() {
        const selectedCards = this.getSelectedCards();

        for (const card of this.displayCards) {
            // if the card is already selected or is not valid for this prompt, don't change anything
            if ([DisplayCardSelectionState.Selected, DisplayCardSelectionState.Invalid].includes(card.selectionState)) {
                continue;
            }

            card.selectionState = this.multiSelectCardCondition(card.card, selectedCards)
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable;
        }

        // update done button state
        if (this.doneButton) {
            if (selectedCards.length === 0) {
                if (this.canChooseNothing) {
                    this.doneButton.disabled = false;
                    this.doneButton.text = DisplayCardsForSelectionPrompt.takeNothingButtonText;
                } else {
                    this.doneButton.disabled = true;
                    this.doneButton.text = 'Done';
                }
            } else {
                this.doneButton.disabled = false;
                this.doneButton.text = 'Done';
            }
        }
    }
}
