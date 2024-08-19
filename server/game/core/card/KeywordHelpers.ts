import { CardActionAbility } from '../ability/CardActionAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { Keyword } from '../Constants';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';

// TODO KEYWORDS: populate these methods

export function GenerateActionAbilitiesFromKeywords(keywords: Set<Keyword>): CardActionAbility[] {
    return [];
}

export function GenerateTriggeredAbilitiesFromKeywords(keywords: Set<Keyword>): TriggeredAbility[] {
    return [];
}

export function GenerateConstantAbilitiesFromKeywords(keywords: Set<Keyword>): IConstantAbility[] {
    return [];
}

// TODO: would something like this be helpful for swu? (see jigoku basecard.ts for reference)
// export function parseKeywords(text: string) {
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