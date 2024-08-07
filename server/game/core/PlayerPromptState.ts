import type Card from './card/Card';
import type Player from './Player';

export class PlayerPromptState {
    selectCard = false;
    selectOrder = false;
    selectRing = false;
    menuTitle = '';
    promptTitle = '';
    buttons = [];
    controls = [];

    selectableCards: Card[] = [];
    selectedCards?: Card[] = [];

    public constructor(public player: Player) {}

    public setSelectedCards(cards: Card[]) {
        this.selectedCards = cards;
    }

    public clearSelectedCards() {
        this.selectedCards = [];
    }

    public setSelectableCards(cards: Card[]) {
        this.selectableCards = cards;
    }

    public clearSelectableCards() {
        this.selectableCards = [];
    }

    setPrompt(prompt: {
        selectCard?: boolean;
        selectOrder?: boolean;
        selectRing?: boolean;
        menuTitle?: string;
        promptTitle: string;
        buttons?: any[];
        controls?: any[];
    }) {
        this.promptTitle = prompt.promptTitle;
        this.selectCard = prompt.selectCard ?? false;
        this.selectOrder = prompt.selectOrder ?? false;
        this.selectRing = prompt.selectRing ?? false;
        this.menuTitle = prompt.menuTitle ?? '';
        this.controls = prompt.controls ?? [];
        this.buttons = !prompt.buttons
            ? []
            : prompt.buttons.map((button) => {
                if (button.card) {
                    const { card, ...properties } = button;
                    return Object.assign(
                        { text: card.name, arg: card.uuid, card: card.getShortSummary() },
                        properties
                    );
                }

                return button;
            });
    }

    cancelPrompt() {
        this.selectCard = false;
        this.selectRing = false;
        this.menuTitle = '';
        this.buttons = [];
        this.controls = [];
    }

    getCardSelectionState(card: Card) {
        const selectable = this.selectableCards.includes(card);
        const index = this.selectedCards?.indexOf(card) ?? -1;
        const result = {
            selected: index !== -1,
            selectable: selectable,
            unselectable: this.selectCard && !selectable
        };

        if (index !== -1 && this.selectOrder) {
            return Object.assign({ order: index + 1 }, result);
        }

        return result;
    }

    getState() {
        return {
            selectCard: this.selectCard,
            selectOrder: this.selectOrder,
            selectRing: this.selectRing,
            menuTitle: this.menuTitle,
            promptTitle: this.promptTitle,
            buttons: this.buttons,
            controls: this.controls
        };
    }
}
