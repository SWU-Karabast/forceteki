import { parse, validate } from '../../../swupgn/src/index';
import type { SwuPgnDocument } from '../../../swupgn/src/types';

/**
 * Who saw what, and what happened at once, written by the reference writer (spec §10.2): `LOOK`
 * and `SEARCH.owner`/`seen` (`[W-50]`), `NAME` (`[W-51]`), `usedBy` (`[W-54]`), and the `blind` and
 * `simul` groups (`[W-53]`).
 */

function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

const idOf = (doc: SwuPgnDocument, name: string): string => {
    const id = (doc.cards ?? []).find((c) => c.name.startsWith(name))?.id;
    expect(id).withContext(`card id for ${name}`)
        .toBeDefined();
    return id ?? '';
};

const ofType = (doc: SwuPgnDocument, t: string): any[] => doc.events.filter((e) => e.t === t);

function expectValid(text: string): void {
    expect(validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch')).withContext('validate()')
        .toEqual([]);
}

describe('SWU-PGN/1.0 looks, names, used-by and simultaneous groups (writer)', function () {
    integration(function (contextRef) {
        it('a look at the top card writes LOOK', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inferno-four#unforgetting'],
                    deck: ['foundling'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.infernoFour);
            context.player1.clickDone();

            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'LOOK')).toEqual([jasmine.objectContaining({
                p: 1, owner: 1, zone: 'deck', cards: [idOf(doc, 'Foundling')], count: 1,
            })]);
            expectValid(text);
        });

        it('a look at the opponent\'s hand writes LOOK', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['viper-probe-droid'] },
                player2: { hand: ['wampa', 'battlefield-marine'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.viperProbeDroid);
            context.player1.clickDone();

            const { text, doc } = writerOutput(context.game);
            const looks = ofType(doc, 'LOOK');
            expect(looks.length).toBe(1);
            expect(looks[0]).toEqual(jasmine.objectContaining({ p: 1, owner: 2, zone: 'hand', count: 2 }));
            expect([...looks[0].cards].sort()).toEqual([idOf(doc, 'Battlefield Marine'), idOf(doc, 'Wampa')].sort());
            expectValid(text);
        });

        it('looking at several cards and placing them top or bottom writes LOOK', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inferno-four#unforgetting'],
                    deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.infernoFour);
            context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'LOOK')).toEqual([jasmine.objectContaining({
                p: 1, owner: 1, zone: 'deck', count: 2,
                cards: [idOf(doc, 'Foundling'), idOf(doc, 'Pyke Sentinel')],
            })]);
            // The look comes before the cards are put back.
            const lookAt = doc.events.findIndex((e) => e.t === 'LOOK');
            const play = doc.events.findIndex((e: any) => e.t === 'PLAY' && e.card === idOf(doc, 'Inferno Four'));
            expect(lookAt).toBeGreaterThan(play);
            expectValid(text);
        });

        it('a search writes the cards seen and whose deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['prepare-for-takeoff'],
                    deck: ['green-squadron-awing', 'battlefield-marine', 'restored-arc170', 'pyke-sentinel', 'inferno-four#unforgetting', 'escort-skiff', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.prepareForTakeoff);
            context.player1.clickCardInDisplayCardPrompt(context.greenSquadronAwing);
            context.player1.clickDone();
            context.player2.clickDone();

            const { text, doc } = writerOutput(context.game);
            const searches = ofType(doc, 'SEARCH');
            expect(searches.length).toBe(1);
            expect(searches[0]).toEqual(jasmine.objectContaining({ p: 1, owner: 1 }));
            expect(searches[0].seen).toEqual([
                'Green Squadron A-Wing', 'Battlefield Marine', 'Restored ARC-170', 'Pyke Sentinel',
                'Inferno Four', 'Escort Skiff', 'Consular Security Force', 'Echo Base Defender',
            ].map((name) => idOf(doc, name)));
            expectValid(text);
        });

        it('naming a card writes NAME', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['regional-governor'] },
                player2: { hand: ['millennium-falcon#piece-of-junk'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.regionalGovernor);
            context.player1.chooseListOption('Millennium Falcon');

            const { text, doc } = writerOutput(context.game);
            const names = ofType(doc, 'NAME');
            expect(names).toEqual([jasmine.objectContaining({ p: 1, name: 'Millennium Falcon' })]);
            // Before the record that uses the name.
            const effectAt = doc.events.findIndex((e) => e.t === 'EFFECT_START');
            expect(effectAt).toBeGreaterThan(doc.events.indexOf(names[0]));
            expectValid(text);
        });

        // Value: protects=naming a trait writes no NAME (NAME is card titles only); fails_when=namesCard is dropped so trait picks emit NAME; why_new=only the card-title path is covered; seam=none; no_claim=other dropdown kinds
        it('naming a trait writes no NAME', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['the-first-legion#vaders-fist'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theFirstLegion);
            context.player1.clickCard(context.p2Base);
            context.player1.chooseListOption('Trooper');

            const { text, doc } = writerOutput(context.game);
            expect(ofType(doc, 'NAME')).toEqual([]);
            expectValid(text);
        });

        it('a When Defeated used by Chimaera names Chimaera in usedBy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chimaera#reinforcing-the-center'],
                    groundArena: ['wartime-trade-official'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chimaera);
            context.player1.clickCard(context.wartimeTradeOfficial);

            const { text, doc } = writerOutput(context.game);
            const official = idOf(doc, 'Wartime Trade Official');
            const chimaera = idOf(doc, 'Chimaera');
            const used = ofType(doc, 'ABILITY_ACTIVATE').filter((e) => e.card === official);
            expect(used).toEqual([jasmine.objectContaining({ p: 1, usedBy: chimaera })]);
            // Chimaera's own ability is not used by anything.
            expect(ofType(doc, 'ABILITY_ACTIVATE').filter((e) => e.card === chimaera)
                .every((e) => e.usedBy === undefined)).toBeTrue();
            expectValid(text);
        });

        it('each player discarding at once writes blind choices and one simul group', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['smoke-and-cinders', 'wampa', 'battlefield-marine', 'pyke-sentinel', 'echo-base-defender'] },
                player2: { hand: ['atst', 'cartel-spacer', 'foundling'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.smokeAndCinders);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickDone();
            context.player2.clickCard(context.atst);

            const { text, doc } = writerOutput(context.game);
            const choices = ofType(doc, 'CHOICE');
            // One CHOICE per card picked: two for player 1, one for player 2.
            expect(choices.map((c) => c.p)).toEqual([1, 1, 2]);
            const blind = choices[0].blind;
            expect(typeof blind).toBe('string');
            expect(choices.every((c) => c.blind === blind)).toBeTrue();
            const asked = doc.events.find((e) => e.seq === blind);
            expect(asked).withContext('blind names the record that asked')
                .toBeDefined();
            expect((asked as any).card).toBe(idOf(doc, 'Smoke and Cinders'));

            const discards = ofType(doc, 'DISCARD');
            expect(discards.length).toBe(3);
            const simul = discards[0].simul;
            expect(typeof simul).toBe('string');
            const group = doc.events.filter((e: any) => e.simul === simul);
            expect(group[0].seq).withContext('simul is the seq of the group\'s first record')
                .toBe(simul);
            for (const d of discards) {
                expect(d.simul).toBe(simul);
            }
            // The group is written consecutively.
            const first = doc.events.indexOf(group[0]);
            expect(doc.events.slice(first, first + group.length)).toEqual(group);
            expectValid(text);
        });

        it('combat damage on both sides is one simul group', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);

            const { text, doc } = writerOutput(context.game);
            const damage = ofType(doc, 'DAMAGE');
            expect(damage.length).toBe(2);
            expect(damage[0].simul).toBe(damage[0].seq);
            expect(damage[1].simul).toBe(damage[0].seq);
            expect(doc.events.filter((e: any) => e.simul != null)).toEqual(damage);
            expectValid(text);
        });

        it('a single damage outside combat has no simul', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            const { doc } = writerOutput(context.game);
            expect(doc.events.filter((e: any) => e.simul != null)).toEqual([]);
        });
    });
});
