import { Card } from '../card/Card';

export enum StatefulPromptType {
    DistributeDamage = 'distributeDamage',
    DistributeHealing = 'distributeHealing'
}

export type IStatefulPromptResults = IDistributeAmongTargetsPromptResults;

export interface IPromptPropertiesBase {
    waitingPromptTitle?: string;
    promptTitle?: string;
}

export interface IDistributeAmongTargetsPromptProperties extends IPromptPropertiesBase {
    type: StatefulPromptType.DistributeDamage | StatefulPromptType.DistributeHealing;
    amount: number;
    source: Card;
    canChooseNoTargets: boolean;
    canDistributeLess: boolean;
    legalTargets: Card[];
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
