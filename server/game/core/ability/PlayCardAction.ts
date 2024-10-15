import * as CostLibrary from '../../costs/CostLibrary';
import { resourceCard } from '../../gameSystems/GameSystemLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { KeywordName, PhaseName, PlayType, Stage } from '../Constants';
import { ICost } from '../cost/ICost';
import { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    protected playType: PlayType;

    public constructor(card: Card, title: string, playType: PlayType, additionalCosts: ICost[] = [], targetResolver: IActionTargetResolver = null) {
        super(card, PlayCardAction.getTitle(title, playType), additionalCosts.concat(CostLibrary.payPlayCardResourceCost(playType)), targetResolver);

        this.playType = playType;
    }

    private static getTitle(title: string, playType: PlayType): string {
        switch (playType) {
            case PlayType.Smuggle:
                return title + ' with Smuggle';
            default:
                return title;
        }
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('location') &&
            !context.player.isCardInPlayableLocation(context.source, this.playType)
        ) {
            return 'location';
        }
        if (
            !ignoredRequirements.includes('cannotTrigger') &&
            !context.source.canPlay(context, this.playType)
        ) {
            return 'cannotTrigger';
        }
        if (PlayType.Smuggle === this.playType && !context.source.hasSomeKeyword(KeywordName.Smuggle)) {
            return 'smuggleKeyword';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }

    public override createContext(player = this.card.controller) {
        return new AbilityContext({
            ability: this,
            game: this.card.game,
            player: player,
            source: this.card,
            stage: Stage.PreTarget,
            costAspects: this.card.aspects
        });
    }

    public override isCardPlayed(): boolean {
        return true;
    }

    public override getAdjustedCost(context) {
        const resourceCost = this.cost.find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }

    public generateSmuggleEvent(context: PlayCardContext) {
        return resourceCard({ target: context.player.getTopCardOfDeck() }).generateEvent(context.source, context);
    }
}
