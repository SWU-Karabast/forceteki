import type { IKeywordProperties, KeywordNameOrProperties } from '../../Interfaces';
import type { Card } from '../card/Card';
import type { PlayType } from '../Constants';
import { Aspect, KeywordName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import * as EnumHelpers from '../utils/EnumHelpers';
import { BountyKeywordInstance, KeywordInstance, KeywordWithAbilityDefinition, KeywordWithCostValues, KeywordWithNumericValue } from './KeywordInstance';
import type { PlayCardAction } from './PlayCardAction';

export function parseKeywords(
    card: Card,
    expectedKeywordsRaw: string[],
    cardText: string,
    pilotText: string
): KeywordInstance[] {
    const expectedKeywords = EnumHelpers.checkConvertToEnum(expectedKeywordsRaw, KeywordName);

    const keywords: KeywordInstance[] = [];

    for (const keywordName of expectedKeywords) {
        if (isNumericType[keywordName]) {
            const keywordValueOrNull = parseNumericKeywordValueIfEnabled(keywordName, cardText, card.internalName);
            if (keywordValueOrNull != null) {
                keywords.push(new KeywordWithNumericValue(keywordName, card, keywordValueOrNull));
            }
        } else if (keywordName === KeywordName.Piloting) {
            const pilotingValuesOrNull = parseKeywordWithCostValuesIfEnabled(KeywordName.Piloting, pilotText, card);
            if (pilotingValuesOrNull != null) {
                keywords.push(pilotingValuesOrNull);
            }
        } else if (keywordName === KeywordName.Smuggle) {
            const smuggleValuesOrNull = parseKeywordWithCostValuesIfEnabled(KeywordName.Smuggle, cardText, card);
            if (smuggleValuesOrNull != null) {
                keywords.push(smuggleValuesOrNull);
            }
        } else if (keywordName === KeywordName.Bounty) {
            if (isKeywordEnabled(keywordName, cardText, card.internalName)) {
                keywords.push(new BountyKeywordInstance(keywordName, card));
            }
        } else if (keywordName === KeywordName.Coordinate) {
            if (isKeywordEnabled(keywordName, cardText, card.internalName)) {
                keywords.push(new KeywordWithAbilityDefinition(keywordName, card));
            }
        } else { // default case is a keyword with no params
            if (isKeywordEnabled(keywordName, cardText, card.internalName)) {
                keywords.push(new KeywordInstance(keywordName, card));
            }
        }
    }

    return keywords;
}

export function keywordFromProperties(properties: IKeywordProperties, card: Card) {
    switch (properties.keyword) {
        case KeywordName.Restore:
        case KeywordName.Raid:
            return new KeywordWithNumericValue(properties.keyword, card, properties.amount);

        case KeywordName.Bounty:
            return new BountyKeywordInstance(properties.keyword, card, properties.ability);

        // TODO: Do we need Piloting here?
        case KeywordName.Smuggle:
            return new KeywordWithCostValues(properties.keyword, card, properties.cost, properties.aspects, false);

        case KeywordName.Coordinate:
            return new KeywordWithAbilityDefinition(properties.keyword, card, properties.ability);

        case KeywordName.Ambush:
        case KeywordName.Grit:
        case KeywordName.Hidden:
        case KeywordName.Overwhelm:
        case KeywordName.Saboteur:
        case KeywordName.Sentinel:
        case KeywordName.Shielded:
            return new KeywordInstance(properties.keyword, card);

        default:
            throw new Error(`Keyword '${(properties as any).keyword}' is not implemented yet`);
    }
}

export const isNumericType: Record<KeywordName, boolean> = {
    [KeywordName.Ambush]: false,
    [KeywordName.Bounty]: false,
    [KeywordName.Coordinate]: false,
    [KeywordName.Exploit]: true,
    [KeywordName.Grit]: false,
    [KeywordName.Hidden]: false,
    [KeywordName.Overwhelm]: false,
    [KeywordName.Piloting]: false,
    [KeywordName.Raid]: true,
    [KeywordName.Restore]: true,
    [KeywordName.Saboteur]: false,
    [KeywordName.Sentinel]: false,
    [KeywordName.Shielded]: false,
    [KeywordName.Smuggle]: false
};

export const hasWhileInPlayAbility: Record<KeywordName, boolean> = {
    [KeywordName.Ambush]: false,
    [KeywordName.Bounty]: false,
    [KeywordName.Coordinate]: true,
    [KeywordName.Exploit]: false,
    [KeywordName.Grit]: false,
    [KeywordName.Hidden]: true,
    [KeywordName.Overwhelm]: false,
    [KeywordName.Piloting]: false,
    [KeywordName.Raid]: false,
    [KeywordName.Restore]: false,
    [KeywordName.Saboteur]: false,
    [KeywordName.Sentinel]: false,
    [KeywordName.Shielded]: false,
    [KeywordName.Smuggle]: false
};

/**
 * Checks if the specific keyword is "enabled" in the text, i.e., if it is on by default
 * or is enabled as part of an ability effect.
 *
 * Should not be used for "numeric" keywords like raid and restore, see {@link parseNumericKeywordValueIfEnabled}.
 *
 * @returns null if the keyword is not enabled, or the numeric value if enabled
 */
function isKeywordEnabled(keyword: KeywordName, cardText: string, cardName: string): boolean {
    const regex = getRegexForKeyword(keyword);
    const matchIter = cardText.matchAll(regex);

    const match = matchIter.next();
    if (match.done) {
        return false;
    }

    if (matchIter.next().done !== true) {
        throw new Error(`Expected to match at most one instance of enabled keyword ${keyword} in card ${cardName}, but found multiple`);
    }

    return true;
}

/**
 * Checks if the specific keyword is "enabled" in the text, i.e., if it is on by default
 * or is enabled as part of an ability effect. Only checks for "numeric" keywords, meaning
 * keywords that have a numberic value like "Raid 2" or "Restore 1".
 *
 * @returns null if the keyword is not enabled, or the numeric value if enabled
 */
function parseNumericKeywordValueIfEnabled(keyword: KeywordName, cardText: string, cardName: string): number | null {
    Contract.assertTrue([KeywordName.Exploit, KeywordName.Raid, KeywordName.Restore].includes(keyword));

    const regex = getRegexForKeyword(keyword);
    const matchIter = cardText.matchAll(regex);

    const match = matchIter.next();
    if (match.done) {
        return null;
    }

    if (matchIter.next().done !== true) {
        throw new Error(`Expected to match at most one instance of enabled keyword ${keyword} in card ${cardName}, but found multiple`);
    }

    // regex capture group will be numeric keyword value
    return Number(match.value[1]);
}

/**
 * Checks if the Smuggle keyword is enabled and returns
 *
 * @returns null if the keyword is not enabled, or the numeric value if enabled
 */
function parseKeywordWithCostValuesIfEnabled(keyword: KeywordName, cardText: string, card: Card): KeywordWithCostValues {
    const regex = getRegexForKeyword(keyword);
    const matchIter = cardText.matchAll(regex);

    const match = matchIter.next();

    if (match.done) {
        return null;
    }

    if (matchIter.next().done !== true) {
        throw new Error(`Expected to match at most one instance of enabled keyword ${keyword} in card ${card.internalName}, but found multiple`);
    }

    const cost = Number(match.value[1]);
    const aspectString = match.value[2];

    let aspects: Aspect[] = [];
    if (aspectString && aspectString.length > 0) {
        aspects = EnumHelpers.checkConvertToEnum(aspectString.toLowerCase().split(' '), Aspect);
    }

    const additionalCosts = match.value[3] !== undefined;

    // regex capture group will be keyword value with costs
    return new KeywordWithCostValues(keyword, card, cost, aspects, additionalCosts);
}

function getRegexForKeyword(keyword: KeywordName) {
    // these regexes check that the keyword is starting on its own line, indicating that it's not part of an ability text.
    // For numeric keywords, the regex also grabs the numeric value after the keyword as a capture group.
    // For Smuggle, this also captures the aspects that are part of the Smuggle cost.
    // Does not capture any ability text for Bounty or Coordinate since that must provided explicitly in the card implementation.

    switch (keyword) {
        case KeywordName.Ambush:
            return /(?:^|(?:\n))Ambush/g;
        case KeywordName.Bounty:
            return /(?:^|(?:\n))Bounty/g;
        case KeywordName.Coordinate:
            return /(?:^|(?:\n))Coordinate/g;
        case KeywordName.Exploit:
            return /(?:^|(?:\n))Exploit ([\d]+)/g;
        case KeywordName.Grit:
            return /(?:^|(?:\n))Grit/g;
        case KeywordName.Hidden:
            return /(?:^|(?:\n))Hidden/g;
        case KeywordName.Overwhelm:
            return /(?:^|(?:\n))Overwhelm/g;
        case KeywordName.Piloting:
            return /Piloting\s\[\s*(\d+)\s+resource(?:s)?\s*([\w\s]*)\]/g;
        case KeywordName.Raid:
            return /(?:^|(?:\n))Raid ([\d]+)/g;
        case KeywordName.Restore:
            return /(?:^|(?:\n))Restore ([\d]+)/g;
        case KeywordName.Saboteur:
            return /(?:^|(?:\n))Saboteur/g;
        case KeywordName.Sentinel:
            return /(?:^|(?:\n))Sentinel/g;
        case KeywordName.Shielded:
            return /(?:^|(?:\n))Shielded/g;
        case KeywordName.Smuggle:
            return /(?:\n)?Smuggle\s\[\s*(\d+)\s+resources(?:,\s*|\s+)([\w\s]+)(,.*)?\]/g;
        default:
            throw new Error(`Keyword '${keyword}' is not implemented yet`);
    }
}

export function getCheapestPlayAction<TAbility extends PlayCardAction>(playType: PlayType, actions: TAbility[]): PlayCardAction | null {
    const nonMatchingActions = actions.filter((action) => action.playType !== playType);
    Contract.assertTrue(nonMatchingActions.length === 0, `Found at least one action that is not a ${playType} play action`);

    if (actions.length === 0) {
        return null;
    }
    if (actions.length === 1) {
        return actions[0];
    }

    let cheapestAction = null;
    let cheapestAmount = Infinity;
    for (const action of actions) {
        Contract.assertTrue(action.isPlayCardAbility());
        const cost = action.getAdjustedCost(action.createContext());
        if (cost < cheapestAmount) {
            cheapestAmount = cost;
            cheapestAction = action;
        }
    }

    return cheapestAction;
}

export function keywordDescription(keyword: KeywordNameOrProperties): string {
    if (typeof keyword === 'string') {
        return Helpers.capitalize(keyword);
    }

    if ('amount' in keyword) {
        return `${Helpers.capitalize(keyword.keyword)} ${keyword.amount}`;
    }

    return Helpers.capitalize(keyword.keyword);
}