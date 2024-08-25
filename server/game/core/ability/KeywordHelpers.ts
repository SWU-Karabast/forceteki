import { CardActionAbility } from './CardActionAbility';
import TriggeredAbility from './TriggeredAbility';
import { Keyword } from '../Constants';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import Contract from '../utils/Contract';
import { RestoreAbility } from '../../abilities/keyword/RestoreAbility';
import { Card } from '../card/Card';
import Game from '../Game';

// TODO KEYWORDS: populate these methods

export function GenerateActionAbilitiesFromKeywords(keywords: Set<Keyword>, game: Game, card: Card, cardText: string): CardActionAbility[] {
    const generatedAbilities = [];

    if (keywords.has(Keyword.Smuggle)) {
        // TODO: smuggle impl
    }

    return generatedAbilities;
}

export function GenerateTriggeredAbilitiesFromKeywords(keywords: Set<Keyword>, game: Game, card: Card, cardText: string): TriggeredAbility[] {
    const generatedAbilities = [];

    if (keywords.has(Keyword.Ambush)) {
        // TODO: ambush impl
    }
    if (keywords.has(Keyword.Bounty)) {
        // TODO: bounty impl
    }
    if (keywords.has(Keyword.Overwhelm)) {
        // TODO: overwhelm impl
    }
    if (keywords.has(Keyword.Raid)) {
        // TODO: raid impl
    }
    if (keywords.has(Keyword.Restore)) {
        const restoreValueOrNull = parseNumericKeywordValueIfEnabled(Keyword.Restore, card, cardText);
        if (restoreValueOrNull != null) {
            generatedAbilities.push(new RestoreAbility(game, card, restoreValueOrNull as number));
        }
    }
    if (keywords.has(Keyword.Saboteur)) {
        // TODO: restore impl
    }
    if (keywords.has(Keyword.Shielded)) {
        // TODO: restore impl
    }

    return generatedAbilities;
}

export function GenerateConstantAbilitiesFromKeywords(keywords: Set<Keyword>, game: Game, card: Card, cardText: string): IConstantAbility[] {
    const generatedAbilities = [];

    if (keywords.has(Keyword.Grit)) {
        // TODO: grit impl
    }
    if (keywords.has(Keyword.Sentinel)) {
        // TODO: sentinel impl
    }

    return generatedAbilities;
}

/**
 * Checks if the specific keyword is "enabled" in the text, i.e., if it is on by default
 * or is enabled as part of an ability effect. Only checks for "numeric" keywords, meaning
 * keywords that have a numberic value like "Raid 2" or "Restore 1".
 *
 * @returns null if the keyword is not enabled, or the numeric value if enabled
 */
function parseNumericKeywordValueIfEnabled(keyword: Keyword, card: Card, cardText: string): number | null {
    if (!Contract.assertTrue(
        [Keyword.Raid, Keyword.Restore].includes(keyword)
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
        throw new Error(`Expected to match at most one instance of enabled keyword ${keyword} in card ${card.internalName}, but found multiple`);
    }

    // regex capture group will be numeric keyword value
    return Number(match.value[1]);
}

function getRegexForKeyword(keyword: Keyword) {
    // these regexes check that the keyword is starting on its own line, indicating that it's not part of an ability text
    // for numeric keywords, the regex also grabs the numeric value after the keyword as a capture group

    switch (keyword) {
        case Keyword.Restore:
            return /(?:^|(?:\n))Restore ([\d]+)/g;
        default:
            throw new Error(`Keyword '${keyword}' is not implemented yet`);
    }
}

// TODO: would something like this be helpful for swu? (see jigoku basecard.ts for reference)
// export function parseCommonTextAbilities(text: string) {
//     const potentialKeywords = [];
//     for (const line of text.split('\n')) {
//         for (const k of line.slice(0, -1).split('.')) {
//             potentialKeywords.push(k.trim());
//         }
//     }

//     for (const keyword of potentialKeywords) {
//         if (ValidKeywords.has(keyword)) {
//             this.printedKeywords.push(keyword);
//         } else if (keyword.startsWith('disguised ')) {
//             this.disguisedKeywordTraits.push(keyword.replace('disguised ', ''));
//         } else if (keyword.startsWith('no attachments except')) {
//             var traits = keyword.replace('no attachments except ', '');
//             this.allowedAttachmentTraits = traits.split(' or ');
//         } else if (keyword.startsWith('no attachments,')) {
//             //catch all for statements that are to hard to parse automatically
//         } else if (keyword.startsWith('no attachments')) {
//             this.allowedAttachmentTraits = ['none'];
//         }
//     }

//     TODO: uncomment
//     for (const keyword of this.printedKeywords) {
//         this.persistentEffect({ effect: AbilityHelper.effects.addKeyword(keyword) });
//     }
// }