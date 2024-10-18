import type { Card } from './card/Card';
import { IDistributeAmongTargetsPromptData } from './gameSteps/PromptInterfaces';
import type Player from './Player';

export interface IPlayerPromptStateProperties {
    buttons?: { text: string; arg?: string; command?: string; card?: Card }[];
    menuTitle: string;
    promptUuid: string;
    promptTitle?: string;

    controls?: { type: string; source: any; targets: any }[];
    selectCard?: boolean;
    selectOrder?: boolean;
    distributeAmongTargets?: IDistributeAmongTargetsPromptData;
    listOptions?: string[];
}

export class PlayerPromptState {
    public selectCard = false;
    public selectOrder = false;
    public distributeAmongTargets?: IDistributeAmongTargetsPromptData = null;
    public menuTitle = '';
    public promptTitle = '';
    public promptUuid = '';
    public buttons = [];
    public controls = [];
    public listOptions = [];

    private selectableCards: Card[] = [];
    private selectedCards?: Card[] = [];

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

    public setPrompt(prompt: IPlayerPromptStateProperties) {
        this.promptTitle = prompt.promptTitle;
        this.selectCard = prompt.selectCard ?? false;
        this.selectOrder = prompt.selectOrder ?? false;
        this.menuTitle = prompt.menuTitle ?? '';
        this.controls = prompt.controls ?? [];
        this.distributeAmongTargets = prompt.distributeAmongTargets;
        this.listOptions = prompt.listOptions ?? [];
        this.promptUuid = prompt.promptUuid;
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

    public cancelPrompt() {
        this.selectCard = false;
        this.menuTitle = '';
        this.buttons = [];
        this.controls = [];
    }

    public getCardSelectionState(card: Card) {
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

    public getState() {
        return {
            selectCard: this.selectCard,
            selectOrder: this.selectOrder,
            distributeAmongTargets: this.distributeAmongTargets,
            listOptions: this.listOptions,
            menuTitle: this.menuTitle,
            promptTitle: this.promptTitle,
            buttons: this.buttons,
            controls: this.controls,
            promptUuid: this.promptUuid
        };
    }
}
