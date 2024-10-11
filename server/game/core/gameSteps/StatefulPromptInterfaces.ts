import { Card } from '../card/Card';
import { CardWithDamageProperty, UnitCard } from '../card/CardTypes';
import Player from '../Player';

export enum StatefulPromptType {
    DistributeDamage = 'distributeDamage',
    DistributeHealing = 'distributeHealing'
}

export type IStatefulPromptResults = IDistributeAmongTargetsPromptResults;

export interface IDistributeAmongTargetsPromptProperties {
    type: StatefulPromptType.DistributeDamage | StatefulPromptType.DistributeHealing;
    amount: number;
    source: Card;
    canChooseNoTargets: boolean;
    canDistributeLess: boolean;
    legalTargets: Card[];
    waitingPromptTitle?: string;
    promptTitle?: string;
    resultsHandler: (results: IDistributeAmongTargetsPromptResults) => void;
}

export interface IDistributeAmongTargetsPromptData {
    type: StatefulPromptType;
    amount: number;
}

export interface IDistributeAmongTargetsPromptResults {
    type: StatefulPromptType;
    valueDistribution: Map<Card, number>;
}
