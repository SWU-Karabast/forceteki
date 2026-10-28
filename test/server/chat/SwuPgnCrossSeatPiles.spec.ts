import { parse, validate } from '../../../swupgn/src/index';
import { fold } from '../../../swupgn/src/fold';
import type { SwuPgnDocument } from '../../../swupgn/src/types';

/**
 * Which seat's pile a MOVE changes (spec §12.1, "Whose pile"), played through the real engine.
 * The fold counts a deck rather than listing it, so it cannot look up which seat's deck a card
 * leaves; it relies on the writer recording the deck's OWNER as `p`. Every card that reaches
 * into an opponent's deck discards from it (Never Tell Me the Odds, Vigilance, Satine Kryze), and
 * a discarded card stays its owner's, so this pins that the writer says so.
 */

function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

describe('SWU-PGN/1.0 cross-seat piles', function () {
    integration(function (contextRef) {
        // Value: protects=a card discarded from the OPPONENT's deck is recorded with its owner's seat, so the fold's deck count and discard pile land on the right seat; fails_when=the recorder writes the acting player as p on a deck->discard MOVE; why_new=no vector discards from an opponent's deck; seam=none; no_claim=deck membership itself is not modelled by the fold
        it('records the owner as p when a player discards from the opponent\'s deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['never-tell-me-the-odds'],
                    spaceArena: ['concord-dawn-interceptors'],
                    deck: ['foresight', 'vanguard-infantry', 'wampa', 'spark-of-hope'],
                },
                player2: {
                    groundArena: ['phaseiii-dark-trooper'],
                    deck: ['battlefield-marine', 'pyke-sentinel', 'volunteer-soldier', 'the-chaos-of-war'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.neverTellMeTheOdds);
            context.player1.clickCard(context.concordDawnInterceptors);

            const { text, doc } = writerOutput(context.game);
            expect(validate(text).issues).withContext('validate()')
                .toEqual([]);

            const p2Names = ['Battlefield Marine', 'Pyke Sentinel', 'Volunteer Soldier', 'The Chaos of War'];
            const nameOf = (id: string) => (doc.cards ?? []).find((c) => c.id === id.split(':')[0])?.name ?? '';
            const milled = doc.events.filter((e: any) => e.t === 'MOVE' && e.from === 'deck' && e.to === 'discard') as any[];
            expect(milled.length).withContext('three from each deck')
                .toBe(6);
            for (const m of milled) {
                const owner = p2Names.some((n) => nameOf(m.card).startsWith(n)) ? 2 : 1;
                expect(m.p).withContext(`${m.seq} ${nameOf(m.card)}`)
                    .toBe(owner);
            }

            const s = fold(doc.events);
            expect(s.players[2]?.discard.map(nameOf).filter((n) => p2Names.some((x) => n.startsWith(x))).length)
                .withContext('P2\'s three are in P2\'s pile')
                .toBe(3);
            expect(s.players[1]?.discard.some((id) => p2Names.some((x) => nameOf(id).startsWith(x))))
                .withContext('none of them in P1\'s pile')
                .toBeFalse();
        });
    });
});
