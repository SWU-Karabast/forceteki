import * as CostLibrary from '../../costs/CostLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { PhaseName, PlayType, Stage } from '../Constants';
import { ICost } from '../cost/ICost';
import { AbilityContext } from './AbilityContext';
import PlayerAction from './PlayerAction';

export type PlayCardContext = AbilityContext & { onPlayCardSource: any };

export abstract class PlayCardAction extends PlayerAction {
    public constructor(card: Card, title: string, additionalCosts: ICost[] = [], targetResolver: IActionTargetResolver = null) {
        super(card, title, additionalCosts.concat(CostLibrary.payAdjustableResourceCost()), targetResolver);
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
            !context.player.isCardInPlayableLocation(context.source, PlayType.PlayFromHand)
        ) {
            return 'location';
        }
        if (
            !ignoredRequirements.includes('cannotTrigger') &&
            !context.source.canPlay(context, PlayType.PlayFromHand)
        ) {
            return 'cannotTrigger';
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

    public override getReducedCost(context) {
        const resourceCost = this.cost.find((cost) => cost.getReducedCost);
        return resourceCost ? resourceCost.getReducedCost(context) : 0;
    }
}
