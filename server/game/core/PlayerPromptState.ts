import type { Card } from './card/Card';
import type { PromptType } from './Constants';
import type { IButton, IDisplayCard, IDistributeAmongTargetsPromptData } from './gameSteps/PromptInterfaces';
import type Player from './Player';

export interface IPlayerPromptStateProperties {
    buttons?: IButton[];
    menuTitle: string;
    promptUuid: string;
    promptTitle?: string;
    promptType?: PromptType;

    selectCard?: boolean;
    selectOrder?: boolean;
    distributeAmongTargets?: IDistributeAmongTargetsPromptData;
    dropdownListOptions?: string[];
    displayCards?: IDisplayCard[];
    perCardButtons?: IButton[];
}

export class PlayerPromptState {
    public selectCard = false;
    public selectOrder = false;
    public distributeAmongTargets?: IDistributeAmongTargetsPromptData = null;
    public menuTitle = '';
    public promptTitle = '';
    public promptUuid = '';
    public promptType = '';
    public buttons = [];
    public dropdownListOptions: string[] = [];
    public displayCards: IDisplayCard[] = [];
    public perCardButtons: IButton[] = [];

    private _selectableCards: Card[] = [];
    private _selectedCards?: Card[] = [];

    public get selectableCards() {
        return this._selectableCards;
    }

    public get selectedCards() {
        return this._selectedCards;
    }

    public constructor(public player: Player) {}

    public setSelectedCards(cards: Card[]) {
        this._selectedCards = cards;
    }

    public clearSelectedCards() {
        this._selectedCards = [];
    }

    public setSelectableCards(cards: Card[]) {
        this._selectableCards = cards;
    }

    public clearSelectableCards() {
        this._selectableCards = [];
    }

    public setPrompt(prompt: IPlayerPromptStateProperties) {
        this.promptTitle = prompt.promptTitle;
        this.promptType = prompt.promptType;
        this.selectCard = prompt.selectCard ?? false;
        this.selectOrder = prompt.selectOrder ?? false;
        this.menuTitle = prompt.menuTitle ?? '';
        this.distributeAmongTargets = prompt.distributeAmongTargets;
        this.dropdownListOptions = prompt.dropdownListOptions ?? [];
        this.promptUuid = prompt.promptUuid;
        this.buttons = prompt.buttons ?? [];
        this.displayCards = prompt.displayCards ?? [];
        this.perCardButtons = prompt.perCardButtons ?? [];
    }

    public cancelPrompt() {
        this.selectCard = false;
        this.menuTitle = '';
        this.buttons = [];
        this.clearSelectableCards();
        this.clearSelectedCards();
    }

    public getCardSelectionState(card: Card) {
        const selectable = this._selectableCards.includes(card);
        const index = this._selectedCards?.indexOf(card) ?? -1;
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
            dropdownListOptions: this.dropdownListOptions,
            menuTitle: this.menuTitle,
            promptTitle: this.promptTitle,
            buttons: this.buttons,
            promptUuid: this.promptUuid,
            promptType: this.promptType,
            displayCards: this.displayCards,
            perCardButtons: this.perCardButtons
        };
    }
}
