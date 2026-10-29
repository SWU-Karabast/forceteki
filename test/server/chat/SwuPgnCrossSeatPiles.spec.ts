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
            // The keyframe gate is checked on its own below, with the harness's setup artifacts set aside;
            // validate() cannot tell those from a real mismatch.
            expect(validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch')).withContext('validate()')
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

        // Value: protects=a card played out of the OPPONENT's deck leaves its owner's deck count and lands under the player who played it; fails_when=the recorder writes the controller as p on the deck->arena MOVE, so the fold takes the card from the wrong deck; why_new=the cases above all discard, and Vermillion is the first card that plays from another seat's deck; seam=none; no_claim=deck order, which the fold does not model
        it('takes a card the opponent plays out of your deck from YOUR deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { spaceArena: ['vermillion#qiras-auction-house'], deck: ['battlefield-marine'] },
                player2: { deck: ['desperado-freighter'] },
            });
            const { context } = contextRef;
            const state = () => fold(writerOutput(context.game).doc.events);
            // The harness deals decks before placing them, with no MOVE, so compare changes.
            const before = state();

            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Your deck');
            context.player1.clickDone();
            context.player1.clickPrompt('Opponent');
            context.player2.clickPrompt('Trigger');
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);

            const after = state();
            expect(validate(writerOutput(context.game).text).issues.filter((i) => i.severity === 'error')).toEqual([]);
            expect(after.players[1].deckSize).withContext('P1\'s deck lost the card')
                .toBe(before.players[1].deckSize - 1);
            expect(after.players[2].deckSize).withContext('P2\'s deck is untouched')
                .toBe(before.players[2].deckSize);
            expect(after.players[2].cards.some((c) => c.zone === 'ground')).withContext('the marine is P2\'s')
                .toBeTrue();
            expect(after.players[1].cards.some((c) => c.zone === 'ground')).withContext('and not P1\'s')
                .toBeFalse();
        });

        // Value: protects=an event the opponent plays out of your deck is used by the opponent and leaves no phantom in either discard; fails_when=ABILITY_ACTIVATE.p falls back to the card's controller, or PLAY_EVENT files the card in the player's pile beside its owner's MOVE; why_new=ship review (Codex); seam=none; no_claim=deck order
        it('an event the opponent plays out of your deck is theirs to use and no discard keeps it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { spaceArena: ['vermillion#qiras-auction-house'], deck: ['resupply'] },
                player2: { deck: ['desperado-freighter'], resources: 3 },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Your deck');
            context.player1.clickDone();
            context.player1.clickPrompt('Opponent');
            context.player2.clickPrompt('Trigger');
            expect(context.resupply).toBeInZone('resource', context.player2);

            const { text, doc } = writerOutput(context.game);
            expect(validate(text).issues.filter((i) => i.severity === 'error')).toEqual([]);
            const resupply = (doc.cards ?? []).find((c) => c.name.startsWith('Resupply'))?.id;
            const uses = doc.events.filter((e: any) => e.t === 'ABILITY_ACTIVATE' && e.card === resupply);
            expect(uses.length).withContext('its ability is recorded')
                .toBeGreaterThan(0);
            expect(uses.map((e: any) => e.p)).withContext('used by the player who played it')
                .toEqual(uses.map(() => 2));
            const s = fold(doc.events);
            expect([...s.players[1].discard, ...s.players[2].discard]).withContext('no discard keeps it')
                .not.toContain(resupply);
        });
    });
});
