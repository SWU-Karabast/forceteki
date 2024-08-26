import { KeywordName } from '../Constants';
import Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import { KeywordInstance, KeywordWithNumericValue } from './KeywordInstance';

export function parseKeywords(expectedKeywordsRaw: string[], cardText: string, cardName: string): KeywordInstance[] {
    const expectedKeywords = EnumHelpers.checkConvertToEnum(expectedKeywordsRaw, KeywordName);

    const keywords: KeywordInstance[] = [];

    for (const keywordName in expectedKeywords) {
        switch (keywordName) {
            case KeywordName.Ambush:
            case KeywordName.Bounty:
            case KeywordName.Grit:
            case KeywordName.Overwhelm:
            case KeywordName.Saboteur:
            case KeywordName.Sentinel:
            case KeywordName.Shielded:
                if (isKeywordEnabled(keywordName, cardText, cardName)) {
                    keywords.push(new KeywordInstance(keywordName));
                }
                break;
            case KeywordName.Raid:
            case KeywordName.Restore:
                const keywordValueOrNull = parseNumericKeywordValueIfEnabled(keywordName, cardText, cardName);
                if (keywordValueOrNull != null) {
                    keywords.push(new KeywordWithNumericValue(keywordName, keywordValueOrNull));
                }
                break;
            case KeywordName.Smuggle:
                // TODO: smuggle impl
                break;
        }
    }

    return keywords;
}

/**
 * Checks if the specific keyword is "enabled" in the text, i.e., if it is on by default
 * or is enabled as part of an ability effect. Only checks for "numeric" keywords, meaning
 * keywords that have a numberic value like "Raid 2" or "Restore 1".
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
    if (!Contract.assertTrue(
        [KeywordName.Raid, KeywordName.Restore].includes(keyword)
    )) {
        return null;
    }

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
        default:
            throw new Error(`Keyword '${keyword}' is not implemented yet`);
    }
}

