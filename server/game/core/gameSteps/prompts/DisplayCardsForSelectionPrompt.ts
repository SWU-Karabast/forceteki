import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IButton, IDisplayCard, ISelectableCard } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IDisplayCardsSelectProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsForSelectionPrompt extends DisplayCardPrompt<IDisplayCardsSelectProperties> {
    private readonly canChooseNothing: boolean;
    private readonly displayCards: ISelectableCard[];
    private readonly doneButton?: IButton;
    private readonly maxCards: number;
    private readonly selectableCondition: (card: Card, currentlySelectedCards: Card[]) => boolean;
    private readonly selectedCardsHandler: (cards: Card[]) => void;

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsSelectProperties) {
        super(game, choosingPlayer, properties);

        this.maxCards = properties.maxCards || 1;
        this.selectableCondition = properties.selectableCondition;
        this.selectedCardsHandler = properties.selectedCardsHandler;

        this.displayCards = properties.displayCards.map((card) => ({
            card,
            selectionState: this.selectableCondition(card, [])
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable,
        }));

        this.canChooseNothing = !!properties.canChooseNothing;

        if (this.canChooseNothing) {
            this.doneButton = { text: 'Take nothing', arg: 'done' };
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
            // if the card is already selected, don't change anything
            if (card.selectionState === DisplayCardSelectionState.Selected) {
                continue;
            }

            card.selectionState = this.selectableCondition(card.card, selectedCards)
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable;
        }

        // update done button state
        if (this.doneButton) {
            if (selectedCards.length === 0) {
                if (this.canChooseNothing) {
                    this.doneButton.disabled = false;
                    this.doneButton.text = 'Take no cards';
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
