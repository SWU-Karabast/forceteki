const { RegExpMatcher, TextCensor, englishDataset, englishRecommendedBlacklistMatcherTransformers, englishRecommendedWhitelistMatcherTransformers, skipNonAlphabeticTransformer } = require('obscenity');

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers.concat(skipNonAlphabeticTransformer()),
    whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers.concat(skipNonAlphabeticTransformer())
});

const censor = new TextCensor();
const input = 'titular';
const matches = matcher.getAllMatches(input);
console.log(censor.applyTo(input, matches));