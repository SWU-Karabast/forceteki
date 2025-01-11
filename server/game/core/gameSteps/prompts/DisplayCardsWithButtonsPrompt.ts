import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IDisplayCard } from '../PromptInterfaces';
import { StatefulPromptType, type IButton, type IDisplayCardsWithButtonsPromptProperties, type IStatefulPromptResults } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsWithButtonsPrompt extends DisplayCardPrompt<IDisplayCardsWithButtonsPromptProperties> {
    private onCardButton: (card: Card, arg: string) => boolean;
    private perCardButtons: Omit<IButton, 'command'>[];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsWithButtonsPromptProperties) {
        Contract.assertTrue(properties.perCardButtons.length > 0);

        super(game, choosingPlayer, properties);

        this.onCardButton = properties.onCardButton;

        for (const button of properties.perCardButtons) {
            button.command = 'statefulPromptResults';
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
            canBeSelected: true
        }));
    }

    public override onStatefulPromptResults(player: Player, results: IStatefulPromptResults, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        Contract.assertTrue(results.type === StatefulPromptType.DisplayCardsWithButtons);

        const selectedCard = this.displayCards.find((card) => card.uuid === results.cardUuid);
        if (!selectedCard) {
            Contract.fail(`Could not find card in prompt with uuid '${results.cardUuid}'`);
        }

        this.onCardButton(selectedCard, results.arg);

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
