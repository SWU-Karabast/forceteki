import * as Util from '../../../../Util';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type { Player } from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IButton, IDisplayCard, ISelectableCard } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IDisplayCardsSelectProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';
import { SelectCardMode } from '../PromptInterfaces';

export class DisplayCardsForSelectionPrompt extends DisplayCardPrompt<IDisplayCardsSelectProperties> {
    private readonly canChooseFewer: boolean;
    private readonly displayCards: ISelectableCard[];
    private readonly doneButton?: IButton;
    private readonly maxCards: number;
    private readonly multiSelectCardCondition: (card: Card, currentlySelectedCards: Card[]) => boolean;
    private readonly noSelectedCardsButtonText: string;
    private readonly selectedCardsButtonText: string;
    private readonly selectedCardsHandler: (cards: Card[]) => void;
    private readonly showSelectionOrder: boolean;
    private readonly displayTextByCardUuid: Map<string, string>;
    private readonly selectCardMode: SelectCardMode;

    private selectedCards: Card[] = [];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsSelectProperties) {
        super(game, choosingPlayer, properties);

        this.maxCards = properties.maxCards || 1;
        this.selectCardMode = this.maxCards > 1 ? SelectCardMode.Multiple : SelectCardMode.Single;
        this.selectedCardsHandler = properties.selectedCardsHandler;
        this.multiSelectCardCondition = properties.multiSelectCondition || (() => true);


        const validCardCondition = properties.validCardCondition || (() => true);

        this.displayCards = properties.displayCards.map((card) => ({
            card,
            // if a card doesn't meet the multi-select condition even when nothing else is selected, we can safely consider it invalid
            selectionState: validCardCondition(card) && this.multiSelectCardCondition(card, [])
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Invalid,
        }));

        this.canChooseFewer = !!properties.canChooseFewer;
        this.showSelectionOrder = !!properties.showSelectionOrder;
        this.selectedCardsButtonText = properties.selectedCardsButtonText || 'Done';
        this.noSelectedCardsButtonText = properties.noSelectedCardsButtonText || 'Take nothing';

        const selectableCardCount = this.displayCards.filter(
            (card) => card.selectionState === DisplayCardSelectionState.Selectable
        ).length;

        if (this.canChooseFewer) {
            this.doneButton = { text: this.noSelectedCardsButtonText, arg: 'done' };
        } else if (this.maxCards > 1) {
            this.doneButton = { text: this.selectedCardsButtonText, arg: 'done', disabled: true };
        } else if (selectableCardCount === 0) {
            // If no cards are selectable, the prompt should be dismissable
            this.doneButton = { text: this.selectedCardsButtonText, arg: 'done' };
        }
        // if there is only one card to select, the done button is not needed as we'll auto-fire when it's clicked

        if (properties.displayTextByCardUuid) {
            const mapKeys = Array.from(properties.displayTextByCardUuid.keys());
            const cardUuids = this.displayCards.map((s) => s.card.uuid);
            Contract.assertTrue(
                Util.stringArraysEqual(mapKeys, cardUuids),
                `Provided card display text map does not match passed display card uuids\n\tMap keys:${mapKeys.join(', ')}\n\tCard uuids:${cardUuids.join(', ')}`
            );

            this.displayTextByCardUuid = properties.displayTextByCardUuid;
        }
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptDisplayCardInternal() {
        return {
            buttons: this.doneButton ? [this.doneButton] : [],
            selectCardMode: this.selectCardMode,
        };
    }

    protected override getDisplayCards(): IDisplayCard[] {
        return this.displayCards.map(({ card, selectionState }) => ({
            cardUuid: card.uuid,
            setId: card.setId,
            internalName: card.internalName,
            selectionState,
            displayText: this.displayTextByCardUuid?.get(card.uuid),
            selectionOrder: selectionState === DisplayCardSelectionState.Selected && this.showSelectionOrder
                ? this.selectedCards.indexOf(card) + 1
                : null,
        }));
    }

    public override menuCommand(_player: Player, arg: string, _uuid: string): boolean {
        if (arg === 'done') {
            this.selectedCardsHandler(this.selectedCards);
            this.complete();
            return true;
        }

        const selectedCard = this.displayCards.find(({ card }) => card.uuid === arg);
        Contract.assertNotNullLike(selectedCard, `Unexpected menu command: '${arg}'`);

        switch (selectedCard.selectionState) {
            case DisplayCardSelectionState.Selectable:
                // if max cards are already selected, do nothing
                if (this.selectedCards.length === this.maxCards) {
                    return false;
                }

                selectedCard.selectionState = DisplayCardSelectionState.Selected;
                this.selectedCards.push(selectedCard.card);

                if (this.maxCards === 1) {
                    this.selectedCardsHandler([selectedCard.card]);
                    this.complete();
                    return true;
                }

                break;
            case DisplayCardSelectionState.Selected:
                selectedCard.selectionState = DisplayCardSelectionState.Selectable;

                const beforeRemoveLength = this.selectedCards.length;
                this.selectedCards = this.selectedCards.filter((card) => card !== selectedCard.card);
                Contract.assertTrue(
                    this.selectedCards.length === beforeRemoveLength - 1,
                    `Attempting to unselect card ${selectedCard.card.internalName} but it is not in the selected cards list`
                );

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

    private refreshCardSelectableStatus() {
        for (const card of this.displayCards) {
            // if the card is already selected or is not valid for this prompt, don't change anything
            if ([DisplayCardSelectionState.Selected, DisplayCardSelectionState.Invalid].includes(card.selectionState)) {
                continue;
            }

            card.selectionState = this.multiSelectCardCondition(card.card, this.selectedCards)
                ? DisplayCardSelectionState.Selectable
                : DisplayCardSelectionState.Unselectable;
        }

        // update done button state
        if (this.doneButton) {
            if (this.selectedCards.length < this.maxCards) {
                if (this.canChooseFewer) {
                    this.doneButton.disabled = false;
                    this.doneButton.text = this.selectedCards.length === 0 ? this.noSelectedCardsButtonText : this.selectedCardsButtonText;
                } else {
                    this.doneButton.disabled = true;
                    this.doneButton.text = this.selectedCardsButtonText;
                }
            } else {
                this.doneButton.disabled = false;
                this.doneButton.text = this.selectedCardsButtonText;
            }
        }
    }
}
