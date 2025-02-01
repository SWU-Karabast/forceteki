import type { ISetId } from '../../Interfaces';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type BaseCardSelector from '../cardSelector/BaseCardSelector';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { OngoingEffectSource } from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';

export enum DisplayCardSelectionState {
    Selectable = 'selectable',
    Selected = 'selected',
    Unselectable = 'unselectable',
    Invalid = 'invalid'
}

export interface IButton {
    text: string;
    arg: string;
    command?: string;
    disabled?: boolean;
}

export interface IDisplayCard {
    cardUuid: string;
    setId: ISetId;
    internalName: string;
    selectionState: DisplayCardSelectionState;
    displayText?: string;
    selectionOrder?: number;
}

export enum StatefulPromptType {
    DistributeDamage = 'distributeDamage',
    DistributeHealing = 'distributeHealing',
    DistributeExperience = 'distributeExperience',
}

export type DistributePromptType =
  | StatefulPromptType.DistributeDamage
  | StatefulPromptType.DistributeExperience
  | StatefulPromptType.DistributeHealing;

export type IStatefulPromptResults = IDistributeAmongTargetsPromptResults;

export interface IPromptPropertiesBase {
    activePromptTitle?: string;
    waitingPromptTitle?: string;
    promptTitle?: string;
}

export interface IDistributeAmongTargetsPromptProperties extends IPromptPropertiesBase {
    type: DistributePromptType;
    amount: number;
    source: Card;
    canChooseNoTargets: boolean;
    canDistributeLess: boolean;
    maxTargets?: number;
    legalTargets: Card[];
    resultsHandler: (results: IDistributeAmongTargetsPromptResults) => void;
}

export interface IDistributeAmongTargetsPromptData {
    type: DistributePromptType;
    amount: number;
}

export interface IDistributeAmongTargetsPromptResults {
    type: DistributePromptType;
    valueDistribution: Map<Card, number>;
}

export interface ISelectCardPromptProperties extends IPromptPropertiesBase {
    source: string | OngoingEffectSource;

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

export interface IDisplayCardPromptPropertiesBase extends IPromptPropertiesBase {
    displayCards: Card[];
    source: string | OngoingEffectSource;
}

export interface IDisplayCardsBasicPromptProperties extends IDisplayCardPromptPropertiesBase {
    displayTextByCardUuid?: Map<string, string>;
}

export interface IDisplayCardsWithButtonsPromptProperties extends IDisplayCardPromptPropertiesBase {
    onCardButton: (card: Card, arg: string) => boolean;
    perCardButtons: IButton[];
}

export interface ISelectableCard {
    card: Card;
    selectionState: DisplayCardSelectionState;
}

export interface IDisplayCardsSelectProperties extends IDisplayCardPromptPropertiesBase {
    selectedCardsHandler: (cards: Card[]) => void;
    validCardCondition: (card: Card) => boolean;
    canChooseNothing?: boolean;
    maxCards?: number;
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[]) => boolean;
    noSelectedCardsButtonText?: string;
    selectedCardsButtonText?: string;
    showSelectionOrder?: boolean;
}
