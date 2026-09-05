import { parse, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';

/**
 * The writer contract on an ORGANIC game: a natural setup phase (initiative, mulligan,
 * resourcing), several rounds of plays, attacks and regroup resourcing, and a real game end,
 * with no GameStateBuilder mid-game override.
 *
 * Every other real-game spec bootstraps at the action phase, which tears down the natural
 * hand and resources WITHOUT emitting a MOVE, so those specs cannot assert handSize or
 * resourcesReady past R1.start. This one folds the whole stream and asserts every keyframe
 * field, unfiltered. It is the proof that MOVE-driven folding matches the engine on a game
 * a real player could have played.
 */
const DECK = [
    'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper',
    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
    'alliance-xwing', 'alliance-xwing', 'alliance-xwing',
    'wampa', 'wampa', 'wampa',
    'atst', 'atst',
    'battlefield-marine', 'battlefield-marine', 'alliance-xwing', 'death-star-stormtrooper', 'wampa',
];

describe('SWU-PGN/1.0 writer contract (organic game)', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: { deck: [...DECK] },
                player2: { deck: [...DECK] },
            });
        });

        it('folds every keyframe exactly, validates clean, and names every id the file mentions', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const p1: any = context.player1;
            const p2: any = context.player2;
            const baseOf = (p: any) => (p === p1 ? context.p2Base : context.p1Base);
            const active = () => (p1.canAct ? p1 : p2);

            // ── setup: initiative, mulligan, two resources each ──
            context.selectInitiativePlayer(p1);
            p1.clickPrompt('Mulligan');
            p2.clickPrompt('Keep');
            for (const p of [p1, p2]) {
                p.clickAnyOfSelectableCards(2);
                p.clickDone();
            }
            expect(game.currentPhase).toBe('action');

            // Drive the game from the engine's own legal-target list: play the most expensive
            // playable unit, otherwise attack the base with a ready unit, otherwise pass.
            const takeTurn = (p: any): void => {
                const targets: any[] = p.currentActionTargets ?? [];
                const playable = targets.filter((c) => c.zoneName === 'hand' && c.isUnit?.())
                    .sort((a, b) => b.cost - a.cost);
                if (playable.length > 0) {
                    p.clickCard(playable[0]);
                    return;
                }
                const attackers = targets.filter((c) => c.isUnit?.() && (c.zoneName === 'groundArena' || c.zoneName === 'spaceArena'));
                if (attackers.length > 0) {
                    p.clickCard(attackers[0]);
                    p.clickCard(baseOf(p));
                    return;
                }
                p.passAction();
            };

            for (let round = 1; round <= 4; round++) {
                let guard = 0;
                while (game.currentPhase === 'action' && guard++ < 40) {
                    takeTurn(active());
                }
                expect(game.currentPhase).toBe('regroup');
                for (const p of [p1, p2]) {
                    if (p.hand.length > 0) {
                        p.clickAnyOfSelectableCards(1);
                    }
                    p.clickDone();
                }
                expect(game.currentPhase).toBe('action');
            }

            // Round 5 has begun; concede so the file carries a real GAME_END.
            game.concede(p2.id);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const text: string = game.getCachedSwuPgn();
            const doc = parse(text);

            // 1. Folding forward reproduces EVERY keyframe field, handSize/resourcesReady included.
            expect(checkKeyframes(doc.events).mismatches).toEqual([]);

            // 2. The reference validator has nothing to say, not even a warning.
            expect(validate(text).issues).toEqual([]);

            // 3. Date is when the game started, not when the file was written (spec §5.1).
            expect(doc.header.date).toBe((game.startedAt ?? game.createdAt).toISOString());

            // 4. GAME_END is the last record and sits at the .end of the phase it happened in (§9.1).
            const last = doc.events[doc.events.length - 1] as any;
            expect(last.t).toBe('GAME_END');
            expect(last.seq).toBe(`R${game.roundNumber}.A.end`);
            expect(doc.header.result).toBe('P1');
            expect(doc.header.reason).toBe('Concession');

            // 5. %%% CARDS covers the header's leaders and bases and every deck id, not only the
            //    ids that events happened to mention (§6.5). A leader that was never deployed
            //    used to be missing.
            const index = new Set((doc.cards ?? []).map((c) => c.id));
            const deckIds = doc.decks.flatMap((d) => d.deck.map(([id]) => id));
            for (const id of [doc.header.p1Leader, doc.header.p1Base, doc.header.p2Leader, doc.header.p2Base, ...deckIds]) {
                expect(index.has(id))
                    .withContext(id)
                    .toBe(true);
            }

            // 6. Deck construction is not a game event: no outsideTheGame->deck MOVE (§10.1).
            expect(doc.events.filter((e: any) => e.t === 'MOVE' && e.from === 'outsideTheGame' && e.to === 'deck')).toEqual([]);

            // 7. A base offered as an attack target is written base@N, like every other base ref (§6.3).
            const choices = doc.events.filter((e: any) => e.t === 'CHOICE') as any[];
            expect(choices.length).toBeGreaterThan(0);
            const bases = new Set([doc.header.p1Base, doc.header.p2Base]);
            expect(choices.flatMap((c) => c.offered).filter((id: string) => bases.has(id))).toEqual([]);
            expect(choices.some((c) => c.offered.some((id: string) => (/^base@[12]$/).test(id)))).toBe(true);
        });
    });
});
