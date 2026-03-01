import type { RegExpMatcherOptions } from 'obscenity';
import { collapseDuplicatesTransformer, resolveConfusablesTransformer, resolveLeetSpeakTransformer, toAsciiLowerCaseTransformer, RegExpMatcher, DataSet, pattern } from 'obscenity';
import { basicProfanityList } from './termLists/BasicProfanityList';

/**
 * Creates a collapseDuplicatesTransformer with standard thresholds for profanity matching.
 * Custom thresholds allow certain characters to appear twice consecutively without collapsing.
 */
function createCollapseDuplicatesTransformer() {
    return collapseDuplicatesTransformer({
        defaultThreshold: 1,
        customThresholds: new Map([
            ['b', 2], // a_bb_o
            ['e', 2], // ab_ee_d
            ['o', 2], // b_oo_nga
            ['l', 2], // fe_ll_atio
            ['s', 2], // a_ss_
            ['g', 2], // ni_gg_er
        ]),
    });
}

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
    createCollapseDuplicatesTransformer(),
];

/**
 * Same as above but without leet speak transformation.
 * This allows matching terms that contain leet speak characters literally (e.g., "4skin").
 */
const englishRecommendedBlacklistMatcherTransformersNoLeet = [
    resolveConfusablesTransformer(),
    toAsciiLowerCaseTransformer(),
    createCollapseDuplicatesTransformer(),
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

const englishRecommendedTransformersNoLeet: Pick<
    RegExpMatcherOptions,
	'blacklistMatcherTransformers' | 'whitelistMatcherTransformers'
> = {
    blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformersNoLeet,
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

export const karabastProfanityMatcherNoLeet = new RegExpMatcher({
    ...buildProfanityList(),
    ...englishRecommendedTransformersNoLeet,
});

export const hateGroupsMatcher = new RegExpMatcher({
    ...buildHateGroupsList(),
    ...hateGroupNamesTransformers,
});
