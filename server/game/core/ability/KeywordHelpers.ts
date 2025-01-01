import type { IKeywordProperties, ITriggeredAbilityProps } from '../../Interfaces';
import { AbilityType, Aspect, KeywordName, RelativePlayer } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import { KeywordInstance, KeywordWithAbilityDefinition, KeywordWithCostValues, KeywordWithNumericValue } from './KeywordInstance';

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
            const smuggleValuesOrNull = parseSmuggleIfEnabled(cardText, cardName);
            if (smuggleValuesOrNull != null) {
                keywords.push(smuggleValuesOrNull);
            }
        } else if (keywordName === KeywordName.Bounty || keywordName === KeywordName.Coordinate) {
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
            const bountyAbilityProps = createBountyAbilityFromProps(properties.ability);
            return new KeywordWithAbilityDefinition(properties.keyword, { ...bountyAbilityProps, type: AbilityType.Triggered });

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

export function createBountyAbilityFromProps(properties: Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen' | 'abilityController'>): ITriggeredAbilityProps {
    const { title, ...otherProps } = properties;

    return {
        title: 'Bounty: ' + title,
        // 7.5.13.E : Resolving a Bounty ability is optional. If a player chooses not to resolve a Bounty ability, they are not considered to have collected that Bounty.
        optional: true,
        when: {
            onCardDefeated: (event, context) => event.card === context.source,
            onCardCaptured: (event, context) => event.card === context.source
        },
        abilityController: RelativePlayer.Opponent,
        ...otherProps
    };
}

export const isNumericType: Record<KeywordName, boolean> = {
    [KeywordName.Ambush]: false,
    [KeywordName.Bounty]: false,
    [KeywordName.Coordinate]: false,
    [KeywordName.Exploit]: true,
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
function parseSmuggleIfEnabled(cardText: string, cardName: string): KeywordWithCostValues {
    const regex = getRegexForKeyword(KeywordName.Smuggle);
    const matchIter = cardText.matchAll(regex);

    const match = matchIter.next();
    if (match.done) {
        return null;
    }

    if (matchIter.next().done !== true) {
        throw new Error(`Expected to match at most one instance of enabled keyword ${KeywordName.Smuggle} in card ${cardName}, but found multiple`);
    }

    const smuggleCost = Number(match.value[1]);
    const aspectString = match.value[2];
    const smuggleAspects = EnumHelpers.checkConvertToEnum(aspectString.toLowerCase().split(' '), Aspect);
    const additionalSmuggleCosts = match.value[3] !== undefined;

    // regex capture group will be keyword value with costs
    return new KeywordWithCostValues(KeywordName.Smuggle, smuggleCost, smuggleAspects, additionalSmuggleCosts);
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

