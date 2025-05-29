import type { RegExpMatcherOptions } from 'obscenity';
import { collapseDuplicatesTransformer, resolveConfusablesTransformer, resolveLeetSpeakTransformer, toAsciiLowerCaseTransformer, RegExpMatcher, DataSet, pattern } from 'obscenity';
import { basicProfanityList } from './termLists/BasicProfanityList';

/**
 * A set of transformers to be used when matching blacklisted patterns with the
 * [[englishDataset | english word dataset]].
 */
const englishRecommendedBlacklistMatcherTransformers = [
    resolveConfusablesTransformer(),
    resolveLeetSpeakTransformer(),
    toAsciiLowerCaseTransformer(),
    // See #23 and #46.
    // skipNonAlphabeticTransformer(),
    collapseDuplicatesTransformer({
        defaultThreshold: 1,
        customThresholds: new Map([
            ['b', 2], // a_bb_o
            ['e', 2], // ab_ee_d
            ['o', 2], // b_oo_nga
            ['l', 2], // fe_ll_atio
            ['s', 2], // a_ss_
            ['g', 2], // ni_gg_er
        ]),
    }),
];

const hateGroupNamesTransformers = [
    resolveConfusablesTransformer(),
    resolveLeetSpeakTransformer(),
    toAsciiLowerCaseTransformer()
];

/**
 * A set of transformers to be used when matching whitelisted terms with the
 * [[englishDataset | english word dataset]].
 */
const englishRecommendedWhitelistMatcherTransformers = [
    toAsciiLowerCaseTransformer(),
    collapseDuplicatesTransformer({
        defaultThreshold: Number.POSITIVE_INFINITY,
        customThresholds: new Map([[' ', 1]]), // collapse spaces
    }),
];

/**
 * Recommended transformers to be used with the [[englishDataset | english word
 * dataset]] and the [[RegExpMatcher]].
 */
const englishRecommendedTransformers: Pick<
    RegExpMatcherOptions,
	'blacklistMatcherTransformers' | 'whitelistMatcherTransformers'
> = {
    blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
    whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
};

function buildProfanityList() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const additionalTerms = require('./termLists/AdditionalProfanityTerms.json');

    const additionalTermsDataset = new DataSet<{ originalWord: string }>();

    for (const term of additionalTerms) {
        additionalTermsDataset.addPhrase((phrase) => phrase.setMetadata({ originalWord: term }).addPattern(pattern`${term}`));
    }

    return additionalTermsDataset.addAll(basicProfanityList).build();
}

function buildHateGroupsList() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hateGroupNames = require('./termLists/HateGroupNames.json');

    const hateGroupNamesDataset = new DataSet<{ originalWord: string }>();

    for (const term of hateGroupNames) {
        hateGroupNamesDataset.addPhrase((phrase) => phrase.setMetadata({ originalWord: term }).addPattern(pattern`${term}`));
    }

    return hateGroupNamesDataset.build();
}

export const karabastProfanityMatcher = new RegExpMatcher({
    ...buildProfanityList(),
    ...englishRecommendedTransformers,
});

export const hateGroupsMatcher = new RegExpMatcher({
    ...buildHateGroupsList(),
    ...hateGroupNamesTransformers,
});
