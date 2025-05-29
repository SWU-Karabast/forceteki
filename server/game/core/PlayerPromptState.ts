import type { Card } from './card/Card';
import type { IButton, IDisplayCard, IDistributeAmongTargetsPromptData, PromptType, SelectCardMode } from './gameSteps/PromptInterfaces';
import type { Player } from './Player';

export interface IPlayerPromptStateProperties {
    buttons?: IButton[];
    menuTitle: string;
    promptUuid: string;
    promptTitle?: string;
    promptType?: PromptType;

    selectCardMode?: SelectCardMode;
    selectOrder?: boolean;
    distributeAmongTargets?: IDistributeAmongTargetsPromptData;
    dropdownListOptions?: string[];
    displayCards?: IDisplayCard[];
    perCardButtons?: IButton[];
    isOpponentEffect?: boolean;

    // not included in the state passed to the FE
    attackTargetingHighlightAttacker?: Card;
}

export class PlayerPromptState {
    public selectCardMode? = null;
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
    public isOpponentEffect = null;

    // not included in the state passed to the FE
    public attackTargetingHighlightAttacker?: Card = null;

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
        this.selectCardMode = prompt.selectCardMode;
        this.selectOrder = prompt.selectOrder ?? false;
        this.menuTitle = prompt.menuTitle ?? '';
        this.distributeAmongTargets = prompt.distributeAmongTargets;
        this.dropdownListOptions = prompt.dropdownListOptions ?? [];
        this.promptUuid = prompt.promptUuid;
        this.buttons = prompt.buttons ?? [];
        this.displayCards = prompt.displayCards ?? [];
        this.perCardButtons = prompt.perCardButtons ?? [];
        this.isOpponentEffect = prompt.isOpponentEffect;

        // not included in the state passed to the FE
        this.attackTargetingHighlightAttacker = prompt.attackTargetingHighlightAttacker;
    }

    public cancelPrompt() {
        this.selectCardMode = null;
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
            unselectable: this.selectCardMode && !selectable
        };

        if (index !== -1 && this.selectOrder) {
            return Object.assign({ order: index + 1 }, result);
        }

        return result;
    }

    public getState() {
        return {
            selectCardMode: this.selectCardMode,
            selectOrder: this.selectOrder,
            distributeAmongTargets: this.distributeAmongTargets,
            dropdownListOptions: this.dropdownListOptions,
            menuTitle: this.menuTitle,
            promptTitle: this.promptTitle,
            buttons: this.buttons,
            promptUuid: this.promptUuid,
            promptType: this.promptType,
            displayCards: this.displayCards,
            perCardButtons: this.perCardButtons,
            isOpponentEffect: this.isOpponentEffect
            // attackTargetingHighlightAttacker is explicitly not included, it's not for passing to the FE
        };
    }
}
