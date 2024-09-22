import * as CostLibrary from '../../costs/CostLibrary';
import { IActionTargetResolver } from '../../TargetInterfaces';
import { Card } from '../card/Card';
import { PlayType } from '../Constants';
import { ICost } from '../cost/ICost';
import { PlayCardAction } from './PlayCardAction';

export class PlayCardFromHandAction extends PlayCardAction {
    public constructor(card: Card, title: string, additionalCosts: ICost[] = [], targetResolver: IActionTargetResolver = null) {
        super(card, title, additionalCosts.concat(CostLibrary.payPlayCardResourceCost()), targetResolver);
    }

    public override meetsRequirements(context?: any, ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('location') &&
            !context.player.isCardInPlayableLocation(context.source, PlayType.PlayFromHand)
        ) {
            return 'location';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }
}