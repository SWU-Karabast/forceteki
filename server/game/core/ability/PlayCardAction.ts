import * as CostLibrary from '../../costs/CostLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { KeywordName, PhaseName, PlayType, Stage } from '../Constants';
import { ICost } from '../cost/ICost';
import { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    playType: PlayType;

    public constructor(card: Card, title: string, playType: PlayType, additionalCosts: ICost[] = [], targetResolver: IActionTargetResolver = null) {
        const fullTitle = title + (PlayType.Smuggle === playType ? ' with Smuggle' : '');//TODO is there a cleaner way to do this?
        super(card, fullTitle, additionalCosts.concat(CostLibrary.payPlayCardResourceCost(playType)), targetResolver);
        
        this.playType = playType;
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('location') &&
            !context.player.isCardInPlayableLocation(context.source, this.playType)
        ) {
            return 'location';
        }
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('cannotTrigger') &&
            !context.source.canPlay(context, this.playType)
        ) {
            return 'cannotTrigger';
        }
        if(PlayType.Smuggle === this.playType) {
            if (!context.source.hasSomeKeyword(KeywordName.Smuggle)) {
                return 'smuggleKeyword';
            }
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
}
