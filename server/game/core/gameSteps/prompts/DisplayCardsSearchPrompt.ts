import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IButton, IDisplayCard, ISelectableCard } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IDisplayCardsSelectProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsSearchPrompt extends DisplayCardPrompt<IDisplayCardsSelectProperties> {
    private readonly canChooseNothing: boolean;
    private readonly doneButton?: IButton;
    private readonly maxCards: number;
    private readonly selectableCondition: (card: Card) => boolean;
    private readonly selectedCardsHandler: (cards: Card[]) => void;

    private displayCards: ISelectableCard[];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsSelectProperties) {
        super(game, choosingPlayer, properties);

        this.maxCards = properties.maxCards || 1;
        this.selectableCondition = properties.selectableCondition;
        this.selectedCardsHandler = properties.selectedCardsHandler;

        this.displayCards = properties.displayCards.map((card) => ({
            card,
            selectionState: this.selectableCondition(card)
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable,
        }));

        this.canChooseNothing = !!properties.canChooseNothing;

        if (this.canChooseNothing) {
            this.doneButton = { text: 'Take no cards', arg: 'done' };
        } else if (this.maxCards > 1) {
            this.doneButton = { text: 'Done', arg: 'done', disabled: true };
        }
        // if there is only one card to select, the done button is not needed as we'll auto-fire when it's clicked
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptInternal() {
        return {};
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

        const searchResultCard = this.displayCards.find(({ card }) => card.uuid === arg);
        Contract.assertNotNullLike(searchResultCard, `Unexpected menu command: '${arg}'`);

        switch (searchResultCard.selectionState) {
            case DisplayCardSelectionState.Selectable:
                searchResultCard.selectionState = DisplayCardSelectionState.Selected;

                if (this.maxCards === 1) {
                    this.selectedCardsHandler([searchResultCard.card]);
                    this.complete();
                    return true;
                }

                // if max cards are already selected, do nothing
                if (this.getSelectedCards().length === this.maxCards) {
                    return false;
                }

                break;
            case DisplayCardSelectionState.Selected:
                searchResultCard.selectionState = DisplayCardSelectionState.Selectable;
                break;
            case DisplayCardSelectionState.Unselectable:
                return false;
            default:
                Contract.fail(`Unexpected selection state: '${searchResultCard.selectionState}'`);
        }

        this.refreshCardSelectableStatus();
        return false;
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }

    private getSelectedCards(): Card[] {
        return this.displayCards
            .filter((searchResultCard) => searchResultCard.selectionState === DisplayCardSelectionState.Selected)
            .map((searchResultCard) => searchResultCard.card);
    }

    private refreshCardSelectableStatus() {
        let nSelected = 0;
        for (const card of this.displayCards) {
            // if the card is already selected, don't change anything
            if (card.selectionState === DisplayCardSelectionState.Selected) {
                nSelected++;
                continue;
            }

            card.selectionState = this.selectableCondition(card.card)
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable;
        }

        // update done button state
        if (this.doneButton) {
            if (nSelected === 0) {
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
