import { IKeywordProperties } from '../../Interfaces';
import { AbilityType, KeywordName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import { KeywordInstance, KeywordWithNumericValue } from './KeywordInstance';

export function parseKeywords(expectedKeywordsRaw: string[], cardText: string, cardName: string): KeywordInstance[] {
    const expectedKeywords = EnumHelpers.checkConvertToEnum(expectedKeywordsRaw, KeywordName);

    const keywords: KeywordInstance[] = [];

    for (const keywordName of expectedKeywords) {
        if (isNumericType[keywordName]) {
            const keywordValueOrNull = parseNumericKeywordValueIfEnabled(keywordName, cardText, cardName);
            if (keywordValueOrNull != null) {
                keywords.push(new KeywordWithNumericValue(keywordName, keywordValueOrNull));
            }
        } else if (keywordName === KeywordName.Smuggle) {
            // TODO SMUGGLE: smuggle keyword creation
        } else {
            // default case is a keyword with no params
            if (isKeywordEnabled(keywordName, cardText, cardName)) {
                keywords.push(new KeywordInstance(keywordName));
            }
        }
    }

    return keywords;
}

export function keywordFromProperties(properties: IKeywordProperties) {
    if (properties.keyword === KeywordName.Restore || properties.keyword === KeywordName.Raid) {
        return new KeywordWithNumericValue(properties.keyword, properties.amount);
    }

    // TODO SMUGGLE: add smuggle here for "gain smuggle" abilities

    return new KeywordInstance(properties.keyword);
}

export const isNumericType: Record<KeywordName, boolean> = {
    [KeywordName.Ambush]: false,
    [KeywordName.Bounty]: false,
    [KeywordName.Grit]: false,
    [KeywordName.Overwhelm]: false,
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
 * @deprecated this is implemented but not yet tested on an actual keyword
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
    Contract.assertTrue([KeywordName.Raid, KeywordName.Restore].includes(keyword));

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

function getRegexForKeyword(keyword: KeywordName) {
    // these regexes check that the keyword is starting on its own line, indicating that it's not part of an ability text
    // for numeric keywords, the regex also grabs the numeric value after the keyword as a capture group

    switch (keyword) {
        case KeywordName.Ambush:
            return /(?:^|(?:\n))Ambush/g;
        case KeywordName.Bounty:
            return /(?:^|(?:\n))Bounty/g;
        case KeywordName.Grit:
            return /(?:^|(?:\n))Grit/g;
        case KeywordName.Overwhelm:
            return /(?:^|(?:\n))Overwhelm/g;
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
        case KeywordName.Smuggle:   // TODO SMUGGLE: regex
        default:
            throw new Error(`Keyword '${keyword}' is not implemented yet`);
    }
}

