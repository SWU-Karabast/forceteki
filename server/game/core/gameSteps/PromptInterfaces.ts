import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type BaseCardSelector from '../cardSelector/BaseCardSelector';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { OngoingEffectSource } from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';

export interface IButton {
    text: string;
    arg: string;
}

export enum StatefulPromptType {
    DistributeDamage = 'distributeDamage',
    DistributeHealing = 'distributeHealing',
    DistributeExperience = 'distributeExperience',
}

export type IStatefulPromptResults = IDistributeAmongTargetsPromptResults;

export interface IPromptPropertiesBase {
    waitingPromptTitle?: string;
    promptTitle?: string;
}

export interface IDistributeAmongTargetsPromptProperties extends IPromptPropertiesBase {
    type: StatefulPromptType;
    amount: number;
    source: Card;
    canChooseNoTargets: boolean;
    canDistributeLess: boolean;
    maxTargets?: number;
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

export interface ISelectCardPromptProperties extends IPromptPropertiesBase {
    source: string | OngoingEffectSource;

    activePromptTitle?: string;
    availableCards?: Card[];
    buttons?: IButton[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    context?: AbilityContext;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem;
    mustSelect?: Card[];
    onCancel?: (player: Player) => void;
    onMenuCommand?: (arg: string) => boolean;
    onSelect?: (card: Card[]) => boolean;
    selectCard?: boolean;
    selectOrder?: boolean;
    selector?: BaseCardSelector;
}
