import type BaseCard from './basecard';
import type Player from './player';
import type Ring from './ring';

export class PlayerPromptState {
    selectCard = false;
    selectOrder = false;
    selectRing = false;
    menuTitle = '';
    promptTitle = '';
    buttons = [];
    controls = [];

    selectableRings: Ring[] = [];
    selectableCards: BaseCard[] = [];
    selectedCards?: BaseCard[] = [];

    public constructor(public player: Player) {}

    public setSelectedCards(cards: BaseCard[]) {
        this.selectedCards = cards;
    }

    public clearSelectedCards() {
        this.selectedCards = [];
    }

    public setSelectableCards(cards: BaseCard[]) {
        this.selectableCards = cards;
    }

    public clearSelectableCards() {
        this.selectableCards = [];
    }

    public setSelectableRings(rings: Ring[]) {
        this.selectableRings = rings;
    }

    public clearSelectableRings() {
        this.selectableRings = [];
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

    getCardSelectionState(card: BaseCard) {
        let selectable = this.selectableCards.includes(card);
        let index = this.selectedCards?.indexOf(card) ?? -1;
        let result = {
            // The `card.selected` property here is a hack for plot selection,
            // which we do differently from normal card selection.
            selected: card.selected || index !== -1,
            selectable: selectable,
            unselectable: this.selectCard && !selectable
        };

        if (index !== -1 && this.selectOrder) {
            return Object.assign({ order: index + 1 }, result);
        }

        return result;
    }

    getRingSelectionState(ring: Ring) {
        if (this.selectRing) {
            return { unselectable: !this.selectableRings.includes(ring) };
        }
        return { unselectable: ring.game.currentConflict && !ring.contested };
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
