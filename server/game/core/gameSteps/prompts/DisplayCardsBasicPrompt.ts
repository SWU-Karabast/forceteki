import * as Util from '../../../../Util';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import type { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IDisplayCard, IDisplayCardsBasicPromptProperties } from '../PromptInterfaces';
import { DisplayCardSelectionState, type IButton } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class DisplayCardsBasicPrompt extends DisplayCardPrompt<IDisplayCardsBasicPromptProperties> {
    private readonly doneButton: IButton;
    private readonly displayTextByCardUuid: Map<string, string>;

    private displayCards: Card[];

    public constructor(game: Game, choosingPlayer: Player, properties: IDisplayCardsBasicPromptProperties) {
        Contract.assertTrue(properties.displayCards.length > 0);

        super(game, choosingPlayer, properties);

        this.displayCards = properties.displayCards;
        this.doneButton = { text: 'Done', arg: 'done' };

        if (properties.displayTextByCardUuid) {
            const mapKeys = Array.from(properties.displayTextByCardUuid.keys());
            const cardUuids = this.displayCards.map((card) => card.uuid);
            Contract.assertTrue(
                Util.stringArraysEqual(mapKeys, cardUuids),
                `Provided card display text map does not match passed display card uuids\n\tMap keys:${mapKeys.join(', ')}\n\tCard uuids:${cardUuids.join(', ')}`
            );

            this.displayTextByCardUuid = properties.displayTextByCardUuid;
        }
    }

    protected override getDefaultWaitingPromptTitle(source: OngoingEffectSource) {
        return `Waiting for opponent to finish viewing cards for ${source.name} ability`;
    }

    protected override getDefaultActivePromptTitle(source: OngoingEffectSource) {
        return `View cards for ${source.name} ability`;
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
            displayText: this.displayTextByCardUuid?.get(card.uuid),
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
