import { PromptType } from '../../Constants';
import type Game from '../../Game';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import type Player from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import type { IDisplayCard, IDisplayCardPromptPropertiesBase } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

export abstract class DisplayCardPrompt<TProperties extends IDisplayCardPromptPropertiesBase> extends UiPrompt {
    protected readonly properties: TProperties;

    private readonly choosingPlayer: Player;
    private readonly promptTitle: string;
    private readonly source: OngoingEffectSource;

    public constructor(game: Game, choosingPlayer: Player, properties: TProperties) {
        super(game);

        this.choosingPlayer = choosingPlayer;
        if (typeof properties.source === 'string') {
            properties.source = new OngoingEffectSource(game, properties.source);
        }

        if (!properties.waitingPromptTitle) {
            properties.waitingPromptTitle = this.getDefaultWaitingPromptTitle(properties.source);
        }
        if (!properties.activePromptTitle) {
            properties.activePromptTitle = this.getDefaultActivePromptTitle(properties.source);
        }

        this.source = properties.source;
        this.properties = Object.assign(this.defaultProperties(), properties);

        this.promptTitle = properties.promptTitle || this.source.name;
    }

    protected abstract activePromptInternal(): Partial<IPlayerPromptStateProperties>;
    protected abstract defaultProperties(): Partial<TProperties>;
    protected abstract getDisplayCards(): IDisplayCard[];

    protected getDefaultWaitingPromptTitle(source: OngoingEffectSource) {
        return `Waiting for opponent to use ${source.name}`;
    }

    protected getDefaultActivePromptTitle(source: OngoingEffectSource) {
        return `Choose cards for ${source.name} ability`;
    }

    public override activeCondition(player) {
        return player === this.choosingPlayer;
    }

    public override activePrompt() {
        return {
            menuTitle: this.properties.activePromptTitle,
            promptTitle: this.promptTitle,
            promptUuid: this.uuid,
            displayCards: this.getDisplayCards(),
            ...this.activePromptInternal(),
            promptType: PromptType.DisplayCards
        };
    }

    public override waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }
}
