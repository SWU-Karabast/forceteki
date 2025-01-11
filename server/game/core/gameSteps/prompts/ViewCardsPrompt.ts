import type Game from '../../Game';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import type { IDisplayCard, IViewCardPromptProperties } from '../PromptInterfaces';
import { DisplayCardPrompt } from './DisplayCardPrompt';

export class ViewCardsPrompt extends DisplayCardPrompt<IViewCardPromptProperties> {
    private cardDisplayText?: string[];

    public constructor(game: Game, choosingPlayer: Player, properties: IViewCardPromptProperties) {
        super(game, choosingPlayer, properties);

        this.cardDisplayText = properties.cardDisplayText ?? [];
    }

    protected override defaultProperties() {
        return {};
    }

    public override activePromptInternal() {
        return {
            cardDisplayText: this.cardDisplayText,
            buttons: [{ text: 'Done', arg: 'done' }]
        };
    }

    protected override getDisplayCards(): IDisplayCard[] {
        return this.displayCards.map((card) => ({
            cardUuid: card.uuid,
            setId: card.setId,
            internalName: card.internalName,
            canBeSelected: false
        }));
    }

    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);

        if (arg === 'done') {
            this.complete();
            return true;
        }

        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent to click done' };
    }
}
