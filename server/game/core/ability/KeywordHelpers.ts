import type { IKeywordProperties } from '../../Interfaces';
import type { PlayType } from '../Constants';
import { Aspect, KeywordName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import { BountyKeywordInstance, KeywordInstance, KeywordWithAbilityDefinition, KeywordWithCostValues, KeywordWithNumericValue } from './KeywordInstance';
import type { PlayCardAction } from './PlayCardAction';

export function parseKeywords(expectedKeywordsRaw: string[], cardText: string, cardName: string): KeywordInstance[] {
    const expectedKeywords = EnumHelpers.checkConvertToEnum(expectedKeywordsRaw, KeywordName);

    const keywords: KeywordInstance[] = [];

    for (const keywordName of expectedKeywords) {
        if (isNumericType[keywordName]) {
            const keywordValueOrNull = parseNumericKeywordValueIfEnabled(keywordName, cardText, cardName);
            if (keywordValueOrNull != null) {
                keywords.push(new KeywordWithNumericValue(keywordName, keywordValueOrNull));
            }
        } else if (keywordName === KeywordName.Piloting) {
            const pilotingValuesOrNull = parseKeywordWithCostValuesIfEnabled(KeywordName.Piloting, cardText, cardName);
            if (pilotingValuesOrNull != null) {
                keywords.push(pilotingValuesOrNull);
            }
        } else if (keywordName === KeywordName.Smuggle) {
            const smuggleValuesOrNull = parseKeywordWithCostValuesIfEnabled(KeywordName.Smuggle, cardText, cardName);
            if (smuggleValuesOrNull != null) {
                keywords.push(smuggleValuesOrNull);
            }
        } else if (keywordName === KeywordName.Bounty) {
            if (isKeywordEnabled(keywordName, cardText, cardName)) {
                keywords.push(new BountyKeywordInstance(keywordName));
            }
        } else if (keywordName === KeywordName.Coordinate) {
            if (isKeywordEnabled(keywordName, cardText, cardName)) {
                keywords.push(new KeywordWithAbilityDefinition(keywordName));
            }
        } else { // default case is a keyword with no params
            if (isKeywordEnabled(keywordName, cardText, cardName)) {
                keywords.push(new KeywordInstance(keywordName));
            }
        }
    }

    return keywords;
}

// "Gain Coordinate" and "gain Exploit" are not yet implemented
export function keywordFromProperties(properties: IKeywordProperties) {
    switch (properties.keyword) {
        case KeywordName.Restore:
        case KeywordName.Raid:
            return new KeywordWithNumericValue(properties.keyword, properties.amount);

        case KeywordName.Bounty:
            return new BountyKeywordInstance(properties.keyword, properties.ability);

        case KeywordName.Smuggle:
            return new KeywordWithCostValues(properties.keyword, properties.cost, properties.aspects, false);

        case KeywordName.Ambush:
        case KeywordName.Grit:
        case KeywordName.Overwhelm:
        case KeywordName.Saboteur:
        case KeywordName.Sentinel:
        case KeywordName.Shielded:
            return new KeywordInstance(properties.keyword);

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
    [KeywordName.Overwhelm]: false,
    [KeywordName.Piloting]: false,
    [KeywordName.Raid]: true,
    [KeywordName.Restore]: true,
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
function parseKeywordWithCostValuesIfEnabled(keyword: KeywordName, cardText: string, cardName: string): KeywordWithCostValues {
    const regex = getRegexForKeyword(keyword);
    const matchIter = cardText.matchAll(regex);

    const match = matchIter.next();
    if (match.done) {
        return null;
    }

    if (matchIter.next().done !== true) {
        throw new Error(`Expected to match at most one instance of enabled keyword ${keyword} in card ${cardName}, but found multiple`);
    }

    const cost = Number(match.value[1]);
    const aspectString = match.value[2];
    const aspects = EnumHelpers.checkConvertToEnum(aspectString.toLowerCase().split(' '), Aspect);
    const additionalCosts = match.value[3] !== undefined;

    // regex capture group will be keyword value with costs
    return new KeywordWithCostValues(keyword, cost, aspects, additionalCosts);
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
        case KeywordName.Overwhelm:
            return /(?:^|(?:\n))Overwhelm/g;
        case KeywordName.Piloting:
            return /(?:^|(?:\n))Piloting/g;
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
