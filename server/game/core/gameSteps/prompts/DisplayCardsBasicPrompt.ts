import * as Util from '../../../../Util';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IDisplayCard, IDisplayCardsBasicPromptProperties } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IButton } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsBasicPrompt extends DisplayCardPrompt<IDisplayCardsBasicPromptProperties> {
    private readonly doneButton: IButton;
    private readonly cardTextByUuid: Map<string, string>;

    private displayCards: Card[];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsBasicPromptProperties) {
        Contract.assertTrue(properties.displayCards.length > 0);

        super(game, choosingPlayer, properties);

        this.displayCards = properties.displayCards;
        this.doneButton = { text: 'Done', arg: 'done' };

        if (properties.cardTextByUuid) {
            const mapKeys = Array.from(properties.cardTextByUuid.keys());
            const cardUuids = this.displayCards.map((card) => card.uuid);
            Contract.assertTrue(
                Util.stringArraysEqual(mapKeys, cardUuids),
                `Provided card display text map does not match passed display card uuids\n\tMap keys:${mapKeys.join(', ')}\n\tCard uuids:${cardUuids.join(', ')}`
            );

            this.cardTextByUuid = properties.cardTextByUuid;
        }
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptInternal() {
        return {
            buttons: [this.doneButton],
        };
    }

    protected override getDisplayCards(): IDisplayCard[] {
        return this.displayCards.map((card) => ({
            cardUuid: card.uuid,
            setId: card.setId,
            internalName: card.internalName,
            selectionState: DisplayCardSelectionState.Invalid,
            displayText: this.cardTextByUuid?.get(card.uuid),
        }));
    }

    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        Contract.assertTrue(arg === 'done', `Unexpected menu command: '${arg}'`);

        this.complete();
        return true;
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }
}
