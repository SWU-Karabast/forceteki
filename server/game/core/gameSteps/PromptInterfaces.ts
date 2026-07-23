import type { ISetId } from '../../Interfaces';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { BaseCardSelector } from '../cardSelector/BaseCardSelector';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { OngoingEffectSourceBase } from '../ongoingEffect/OngoingEffectSource';
import type { Player } from '../Player';

export enum DisplayCardSelectionState {
    Selectable = 'selectable',
    Selected = 'selected',
    Unselectable = 'unselectable',
    Invalid = 'invalid',
    ViewOnly = 'viewOnly'
}

export enum PromptType {
    Initiative = 'initiative',
    Number = 'number',
    Resource = 'resource',
    ActionWindow = 'actionWindow',
    DisplayCards = 'displayCards',
    DistributeAmongTargets = 'distributeAmongTargets',
    TriggerWindow = 'triggerWindow',
    PassDelay = 'passDelay',
    BatchTriggerResolution = 'batchTriggerResolution',
}

export interface IButton {
    text: string;
    arg: string;
    command?: string;
    disabled?: boolean;
}

export interface ITriggerWindowSourceCard {
    id: string;
    uuid: string;
    name: string;
    setId?: Partial<ISetId>;
    type: string;
    printedType?: string;
}

export interface ITriggerWindowButton extends IButton {
    sourceCard?: ITriggerWindowSourceCard;
    hasLegalEffects: boolean;

    /** Number of similar triggers this button represents (> 1 when several were grouped into one choice) */
    count?: number;
}

/**
 * A single selectable entry in the "choose which trigger to resolve first" prompt. Usually one per
 * triggered ability, but a window may collapse several similar triggers into one choice (e.g. all of a
 * unit's Advantage tokens, or a heal that fires once per defeated unit). Accessors are lazy so they're
 * only evaluated when a prompt is actually shown — computing a title eagerly can have side effects and
 * crash for sources that have already left play.
 */
export interface IResolutionChoice {
    getTitle: () => string;
    getSourceCard: () => ITriggerWindowSourceCard | undefined;
    hasLegalEffects: () => boolean;
    handler: () => void;

    /** Number of grouped triggers this choice represents; omitted or 1 for an ungrouped single trigger */
    count?: number;
}

/**
 * Payload for the batch-resolution modal shown after selecting a grouped trigger. Lets the player choose
 * to resolve just the next instance or all remaining instances of that trigger.
 */
export interface IBatchTriggerResolutionPromptData {
    sourceCard?: ITriggerWindowSourceCard;
    title: string;
    remainingCount: number;
}

export interface INumberPromptData {
    min: number;
    max: number;
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
    DistributeIndirectDamage = 'distributeIndirectDamage',
    DistributeHealing = 'distributeHealing',
    DistributeExperience = 'distributeExperience',
    DistributeAdvantage = 'distributeAdvantage',
}

export enum SelectCardMode {
    Single = 'single',
    Multiple = 'multiple',
}

export type DistributePromptType =
  | StatefulPromptType.DistributeDamage
  | StatefulPromptType.DistributeIndirectDamage
  | StatefulPromptType.DistributeExperience
  | StatefulPromptType.DistributeAdvantage
  | StatefulPromptType.DistributeHealing;

export type IStatefulPromptResults = IDistributeAmongTargetsPromptResults;

export interface IPromptPropertiesBase {
    activePromptTitle?: ((context: AbilityContext) => string) | string;
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
    resultsHandler: (results: IDistributeAmongTargetsPromptMapResults) => void;
}

export interface IDistributeAmongTargetsPromptData {
    type: DistributePromptType;
    amount: number;
    isIndirectDamage: boolean;
    canDistributeLess: boolean;
    canChooseNoTargets: boolean;
    maxTargets?: number;
}

export interface IDistributeAmongTargetsPromptResults {
    type: DistributePromptType;
    valueDistribution: {
        uuid: string;
        amount: number;
    }[];
}

export interface IDistributeAmongTargetsPromptMapResults {
    type: DistributePromptType;
    valueDistribution: Map<Card, number>;
}

export interface ISelectCardPromptProperties extends IPromptPropertiesBase {
    source: string | OngoingEffectSourceBase;
    isOpponentEffect: boolean;

    activePromptTitle?: ((context: AbilityContext, selectedCards?: Card[]) => string) | string;
    attackTargetingHighlightAttacker?: Card;
    availableCards?: Card[];
    buttons?: IButton[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    context?: AbilityContext;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem;
    mustSelect?: Card[];
    onCancel?: (player: Player) => void;
    onMenuCommand?: (arg: string) => boolean;
    onSelect?: (card: Card | Card[]) => boolean;
    onSelectionSetChanged?: (selectedCards: Card[], context: AbilityContext) => void;
    selectCardMode: SelectCardMode;
    selectOrder?: boolean;
    selector: BaseCardSelector<AbilityContext>;
}

export interface IDisplayCardPromptPropertiesBase extends IPromptPropertiesBase {
    displayCards: Card[];
    source: string | OngoingEffectSourceBase;
}

export interface IDisplayCardsBasicPromptProperties extends IDisplayCardPromptPropertiesBase {
    displayTextByCardUuid?: Map<string, string>;
}

export interface IDisplayCardsWithButtonsPromptProperties extends IDisplayCardPromptPropertiesBase {
    onCardButton: (card: Card, arg: string) => void;
    perCardButtons: IButton[];
    onComplete?: () => void;
}

export interface ISelectableCard {
    card: Card;
    selectionState: DisplayCardSelectionState;
}

export interface IDisplayCardsSelectProperties extends IDisplayCardPromptPropertiesBase {
    selectedCardsHandler: (cards: Card[]) => void;
    validCardCondition?: (card: Card) => boolean;
    canChooseFewer?: boolean;
    maxCards?: number;
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[]) => boolean;
    noSelectedCardsButtonText?: string;
    selectedCardsButtonText?: string;
    showSelectionOrder?: boolean;
    displayTextByCardUuid?: Map<string, string>;
}
