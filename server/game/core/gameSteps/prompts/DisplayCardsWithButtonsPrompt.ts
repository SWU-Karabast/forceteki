import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IDisplayCard } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IButton, type IDisplayCardsWithButtonsPromptProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsWithButtonsPrompt extends DisplayCardPrompt<IDisplayCardsWithButtonsPromptProperties> {
    private readonly onCardButton: (card: Card, arg: string) => boolean;
    private readonly perCardButtons: Omit<IButton, 'command'>[];

    private displayCards: Card[];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsWithButtonsPromptProperties) {
        Contract.assertTrue(properties.perCardButtons.length > 0);
        Contract.assertTrue(properties.displayCards.length > 0);

        super(game, choosingPlayer, properties);

        this.displayCards = properties.displayCards;
        this.onCardButton = properties.onCardButton;

        for (const button of properties.perCardButtons) {
            button.command = 'perCardMenuButton';
        }

        this.perCardButtons = properties.perCardButtons;
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptInternal() {
        return {
            perCardButtons: this.perCardButtons
        };
    }

    protected override getDisplayCards(): IDisplayCard[] {
        return this.displayCards.map((card) => ({
            cardUuid: card.uuid,
            setId: card.setId,
            internalName: card.internalName,
            selectionState: DisplayCardSelectionState.Selectable
        }));
    }


    public override onPerCardMenuCommand(player: Player, arg: string, cardUuid: string, uuid: string, method: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        const selectedCard = this.displayCards.find((card) => card.uuid === cardUuid);
        if (!selectedCard) {
            Contract.fail(`Could not find card in prompt with uuid '${cardUuid}'`);
        }

        this.onCardButton(selectedCard, arg);

        this.displayCards = this.displayCards.filter((card) => card !== selectedCard);

        if (this.displayCards.length === 0) {
            this.complete();
            return true;
        }

        return false;
    }

    public override menuCommand(_player: Player, arg: string, _uuid: string): boolean {
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }
}
