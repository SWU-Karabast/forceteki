import { DataSet, pattern } from 'obscenity';

/**
 * Creates a pattern that automatically handles i/l visual confusables.
 * Replaces 'l' characters with '[i][l]' to match either,
 * since capital 'I' and lowercase 'l' look identical in many fonts.
 *
 * Characters already inside bracket groups (e.g., [abc]) are left unchanged.
 */
function normalizedPattern(strings: TemplateStringsArray, ...values: unknown[]): ReturnType<typeof pattern> {
    // Process the template string to replace i/l with [il]
    const processedStrings = strings.map((str) => {
        let result = '';
        let insideBracket = false;

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (char === '[') {
                insideBracket = true;
                result += char;
            } else if (char === ']') {
                insideBracket = false;
                result += char;
            } else if (!insideBracket && (char === 'l')) {
                result += '[i][l]';
            } else {
                result += char;
            }
        }

        return result;
    });

    // Create a new TemplateStringsArray-like object
    const processedTemplateStrings = Object.assign([...processedStrings], { raw: processedStrings });

    return pattern(processedTemplateStrings as TemplateStringsArray, ...values);
}

/**
 * All the profane words that are included in the [[englishDataset | english dataset]] by default.
 */
type EnglishProfaneWord =
  | 'abeed'
  | 'abo'
  | 'africoon'
  | 'anal'
  | 'anus'
  | 'arabush'
  | 'arse'
  | 'ass'
  | 'bastard'
  | 'bestiality'
  | 'bitch'
  | 'blowjob'
  | 'blowme'
  | 'bollocks'
  | 'boob'
  | 'boonga'
  | 'buttplug'
  | 'chingchong'
  | 'chink'
  | 'cock'
  | 'coloredboy'
  | 'cuck'
  | 'cum'
  | 'cunt'
  | 'deepthroat'
  | 'dick'
  | 'dildo'
  | 'doggystyle'
  | 'penetration'
  | 'dyke'
  | 'ejaculate'
  | 'fag'
  | 'felch'
  | 'fellatio'
  | 'finger bang'
  | 'fisting'
  | 'foreskin'
  | 'fuck'
  | 'fys'
  | 'gangbang'
  | 'handjob'
  | 'hentai'
  | 'hooker'
  | 'incest'
  | 'jerk off'
  | 'jizz'
  | 'kike'
  | 'kkk'
  | 'kys'
  | 'lube'
  | 'masturbate'
  | 'negro'
  | 'nigger'
  | 'orgasm'
  | 'orgy'
  | 'penis'
  | 'piss'
  | 'poofter'
  | 'porn'
  | 'prick'
  | 'pussy'
  | 'queer'
  | 'rape'
  | 'retard'
  | 'scat'
  | 'semen'
  | 'sex'
  | 'shit'
  | 'slut'
  | 'swisher'
  | 'tedbundy'
  | 'tit'
  | 'tranny'
  | 'turd'
  | 'twat'
  | 'vagina'
  | 'wank'
  | 'whore';

/**
 * A dataset of profane English words.
 *
 * @example
 * ```typescript
 * const matcher = new RegExpMatcher({
 * 	...englishDataset.build(),
 * 	...englishRecommendedTransformers,
 * });
 * ```
 * @example
 * ```typescript
 * // Extending the data-set by adding a new word and removing an existing one.
 * const myDataset = new DataSet()
 * 	.addAll(englishDataset)
 * 	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'vagina')
 * 	.addPhrase((phrase) => phrase.addPattern(normalizedPattern`|balls|`));
 * ```
 * @copyright
 * The words are taken from the [cuss](https://github.com/words/cuss) project,
 * with some modifications.
 *
 * ```text
 * (The MIT License)
 *
 * Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ```
 */
export const basicProfanityList = new DataSet<{ originalWord: EnglishProfaneWord }>()
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'abo' }).addPattern(normalizedPattern`|ab[b]o[s]|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'abeed' }).addPattern(normalizedPattern`ab[b]eed`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'africoon' }).addPattern(normalizedPattern`africoon`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'anal' })
            .addPattern(normalizedPattern`|anal`)
            .addWhitelistedTerm('analabos')
            .addWhitelistedTerm('analagous')
            .addWhitelistedTerm('analav')
            .addWhitelistedTerm('analy')
            .addWhitelistedTerm('analog')
            .addWhitelistedTerm('an al')
            .addPattern(normalizedPattern`danal`)
            .addPattern(normalizedPattern`eanal`)
            .addPattern(normalizedPattern`fanal`)
            .addWhitelistedTerm('fan al')
            .addPattern(normalizedPattern`ganal`)
            .addWhitelistedTerm('gan al')
            .addPattern(normalizedPattern`ianal`)
            .addWhitelistedTerm('ian al')
            .addPattern(normalizedPattern`janal`)
            .addWhitelistedTerm('trojan al')
            .addPattern(normalizedPattern`kanal`)
            .addPattern(normalizedPattern`lanal`)
            .addWhitelistedTerm('lan al')
            .addPattern(normalizedPattern`lanal`)
            .addWhitelistedTerm('lan al')
            .addPattern(normalizedPattern`oanal|`)
            .addPattern(normalizedPattern`panal`)
            .addWhitelistedTerm('pan al')
            .addPattern(normalizedPattern`qanal`)
            .addPattern(normalizedPattern`ranal`)
            .addPattern(normalizedPattern`sanal`)
            .addPattern(normalizedPattern`tanal`)
            .addWhitelistedTerm('tan al')
            .addPattern(normalizedPattern`uanal`)
            .addWhitelistedTerm('uan al')
            .addPattern(normalizedPattern`vanal`)
            .addWhitelistedTerm('van al')
            .addPattern(normalizedPattern`wanal`)
            .addPattern(normalizedPattern`xanal`)
            .addWhitelistedTerm('texan al')
            .addPattern(normalizedPattern`yanal`)
            .addPattern(normalizedPattern`zanal`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'anus' })
            .addPattern(normalizedPattern`anus`)
            .addWhitelistedTerm('an us')
            .addWhitelistedTerm('tetanus')
            .addWhitelistedTerm('uranus')
            .addWhitelistedTerm('janus')
            .addWhitelistedTerm('manus'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'arabush' }).addPattern(normalizedPattern`arab[b]ush`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'arse' })
            .addPattern(normalizedPattern`|ars[s]e`)
            .addWhitelistedTerm('arsen'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'ass' })
            .addPattern(normalizedPattern`|ass`)
            .addWhitelistedTerm('assa')
            .addWhitelistedTerm('assem')
            .addWhitelistedTerm('assen')
            .addWhitelistedTerm('asser')
            .addWhitelistedTerm('asset')
            .addWhitelistedTerm('assev')
            .addWhitelistedTerm('assi')
            .addWhitelistedTerm('assoc')
            .addWhitelistedTerm('assoi')
            .addWhitelistedTerm('assu'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bastard' }).addPattern(normalizedPattern`bas[s]tard`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bestiality' }).addPattern(normalizedPattern`be[e][a]s[s]tial`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'bitch' })
            .addPattern(normalizedPattern`bitch`)
            .addPattern(normalizedPattern`bich|`),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'blowjob' }).addPattern(normalizedPattern`b[b]l[l][o]wj[o]b`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'blowme' }).addPattern(normalizedPattern`b[b]l[l]o[w][ ]me`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bollocks' }).addPattern(normalizedPattern`bol[l]ock`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'boob' }).addPattern(normalizedPattern`boob`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'boonga' })
            .addPattern(normalizedPattern`boonga`)
            .addWhitelistedTerm('baboon ga'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'buttplug' }).addPattern(normalizedPattern`buttplug`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'chingchong' }).addPattern(normalizedPattern`chingchong`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'chink' })
            .addPattern(normalizedPattern`chink`)
            .addWhitelistedTerm('chin k'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'cock' })
            .addPattern(normalizedPattern`|cock|`)
            .addPattern(normalizedPattern`|cocks`)
            .addPattern(normalizedPattern`|cockp`)
            .addPattern(normalizedPattern`|cocke[e]|`)
            .addWhitelistedTerm('cockney'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'cuck' })
            .addPattern(normalizedPattern`cuck`)
            .addWhitelistedTerm('cuckoo'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'cum' })
            .addPattern(normalizedPattern`|cum`)
            .addWhitelistedTerm('cumu')
            .addWhitelistedTerm('cumb'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'cunt' })
            .addPattern(normalizedPattern`|cunt`)
            .addPattern(normalizedPattern`cunt|`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'deepthroat' })
            .addPattern(normalizedPattern`deepthro[o]at`)
            .addPattern(normalizedPattern`deepthro[o]t`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'dick' })
            .addPattern(normalizedPattern`|dck|`)
            .addPattern(normalizedPattern`dick`)
            .addWhitelistedTerm('benedick')
            .addWhitelistedTerm('dickens'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'dildo' }).addPattern(normalizedPattern`dildo`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'doggystyle' }).addPattern(normalizedPattern`d[o]g[g]ys[s]t[y]l[l]`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'penetration' }).addPattern(normalizedPattern`penetra`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'dyke' })
            .addPattern(normalizedPattern`dyke`)
            .addWhitelistedTerm('van dyke'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'ejaculate' })
            .addPattern(normalizedPattern`e[e]jacul`)
            .addPattern(normalizedPattern`e[e]jakul`)
            .addPattern(normalizedPattern`e[e]acul[l]ate`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'fag' })
            .addPattern(normalizedPattern`|fag`)
            .addPattern(normalizedPattern`f[a]ggot`)
            .addPattern(normalizedPattern`|phag`)
            .addPattern(normalizedPattern`ph[a]ggot`),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'felch' }).addPattern(normalizedPattern`fe[e]l[l]ch`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fellatio' }).addPattern(normalizedPattern`f[e][e]llat`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'finger bang' }).addPattern(normalizedPattern`fingerbang`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fisting' }).addPattern(normalizedPattern`fistin`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'fuck' })
            .addPattern(normalizedPattern`f[?]ck`)
            .addPattern(normalizedPattern`|fk`)
            .addPattern(normalizedPattern`|fu|`)
            .addPattern(normalizedPattern`|fuk`)
            .addPattern(normalizedPattern`|fok|`)
            .addWhitelistedTerm('fick')
            .addWhitelistedTerm('kung-fu')
            .addWhitelistedTerm('kung fu'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'gangbang' }).addPattern(normalizedPattern`g[?]ngbang`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'handjob' }).addPattern(normalizedPattern`h[?]ndjob`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'hentai' }).addPattern(normalizedPattern`h[e][e]ntai`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'hooker' }).addPattern(normalizedPattern`hooker`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'incest' }).addPattern(normalizedPattern`incest`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'jerk off' }).addPattern(normalizedPattern`jerkoff`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'jizz' }).addPattern(normalizedPattern`jizz`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'kike' }).addPattern(normalizedPattern`kike`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'lube' }).addPattern(normalizedPattern`lube`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'masturbate' })
            .addPattern(normalizedPattern`m[?]sturbate`)
            .addPattern(normalizedPattern`masterbate`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'negro' })
            .addPattern(normalizedPattern`negro`)
            .addWhitelistedTerm('montenegro')
            .addWhitelistedTerm('negron')
            .addWhitelistedTerm('stoneground')
            .addWhitelistedTerm('winegrow'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'nigger' })
            .addPattern(normalizedPattern`n[i]gger`)
            .addPattern(normalizedPattern`n[i]gga`)
            .addPattern(normalizedPattern`|nig|`)
            .addPattern(normalizedPattern`|nigs|`)
            .addPattern(normalizedPattern`|snigger|`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'orgasm' })
            .addPattern(normalizedPattern`[or]gasm`)
            .addWhitelistedTerm('gasma'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'orgy' })
            .addPattern(normalizedPattern`orgy`)
            .addPattern(normalizedPattern`orgies`)
            .addWhitelistedTerm('porgy'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'penis' })
            .addPattern(normalizedPattern`pe[e]nis`)
            .addPattern(normalizedPattern`|pnis`)
            .addWhitelistedTerm('pen is'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'piss' }).addPattern(normalizedPattern`|piss`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'porn' })
            .addPattern(normalizedPattern`|prn|`)
            .addPattern(normalizedPattern`porn`)
            .addWhitelistedTerm('p orna'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'prick' }).addPattern(normalizedPattern`|prick[s]|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'pussy' }).addPattern(normalizedPattern`p[u]ssy`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'queer' }).addPattern(normalizedPattern`queer[s]`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'rape' })
            .addPattern(normalizedPattern`|rape`)
            .addPattern(normalizedPattern`|rapis[s]t`),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'retard' }).addPattern(normalizedPattern`retard`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'scat' }).addPattern(normalizedPattern`|s[s]cat|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'semen' }).addPattern(normalizedPattern`|s[s]e[e]me[e]n`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'sex' })
            .addPattern(normalizedPattern`|s[s]e[e]x|`)
            .addPattern(normalizedPattern`|s[s]e[e]xy|`),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'shit' })
            .addPattern(normalizedPattern`|shit`)
            .addPattern(normalizedPattern`shit|`)
            .addWhitelistedTerm('s hit')
            .addWhitelistedTerm('sh it')
            .addWhitelistedTerm('shi t')
            .addWhitelistedTerm('shitake'),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'slut' }).addPattern(normalizedPattern`s[s]lut`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'tit' })
            .addPattern(normalizedPattern`|tit|`)
            .addPattern(normalizedPattern`|tits|`)
            .addPattern(normalizedPattern`|titt`)
            .addPattern(normalizedPattern`|tiddies`)
            .addPattern(normalizedPattern`|tities`),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'tranny' }).addPattern(normalizedPattern`tranny`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'turd' })
            .addPattern(normalizedPattern`|turd`)
            .addWhitelistedTerm('turducken'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'twat' })
            .addPattern(normalizedPattern`|twat`)
            .addWhitelistedTerm('twattle'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'vagina' })
            .addPattern(normalizedPattern`vagina`)
            .addPattern(normalizedPattern`|v[?]gina`),
    )
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'wank' }).addPattern(normalizedPattern`|wank`))
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'whore' })
            .addPattern(normalizedPattern`|wh[o]re|`)
            .addPattern(normalizedPattern`|who[o]res[s]|`)
            .addWhitelistedTerm('who\'re'),
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'kkk' })
            .addPattern(normalizedPattern`|kkk|`)
            .addPattern(normalizedPattern`kukluxklan`)
            .addPattern(normalizedPattern`ku klux klan`)
            .addPattern(normalizedPattern`|klan`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'coloredboy' })
            .addPattern(normalizedPattern`col[o][u]red[ ]boy`)
            .addPattern(normalizedPattern`col[o][u]red[ ]man`)
            .addPattern(normalizedPattern`col[o][u]red[ ]guy`)
            .addPattern(normalizedPattern`col[o][u]red[ ]girl`)
            .addPattern(normalizedPattern`col[o][u]red[ ]woman`)
            .addPattern(normalizedPattern`col[o][u]red[ ]person`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'tedbundy' })
            .addPattern(normalizedPattern`ted[ ]bundy`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'foreskin' })
            .addPattern(normalizedPattern`for[e][ ]skin`)
            .addPattern(normalizedPattern`4skin`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'fys' })
            .addPattern(normalizedPattern`|fys|`)
            .addPattern(normalizedPattern`|gfys|`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'kys' })
            .addPattern(normalizedPattern`|kys|`)
            .addPattern(normalizedPattern`|gkys|`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'poofter' })
            .addPattern(normalizedPattern`poofter`)
            .addPattern(normalizedPattern`phoofer`)
    )
    .addPhrase((phrase) =>
        phrase
            .setMetadata({ originalWord: 'swisher' })
            .addPattern(normalizedPattern`swisher`)
    );
