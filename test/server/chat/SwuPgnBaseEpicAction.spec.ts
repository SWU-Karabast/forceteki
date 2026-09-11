import { parse, fold, stateAt } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';

// A BASE's Epic Action (SWU-PGN C-06), raised by the SWUForge author against §11's claim to
// cover all of CR 1.16's game state.
//
// CR 1.16 counts Epic Action status as game state, and §11 tracked it only on the LEADER. A base
// can carry one too -- 12 do (Tarkintown, Security Complex, Jedha City, Dooku's Palace, ...) --
// and `setEpicActionAbility` is registrable ONLY on a base (IBaseAbilityRegistrar), while a
// leader's single Epic Action is its deploy, shared across "Deploy X" and "Deploy X as a Pilot"
// through one deployEpicActionLimit. So the two are separate abilities on separate cards, and
// one flag each is right -- the leader's was already there, the base's was missing.
//
// This also gates the §6.3 ref: a base names itself `base@N` on its ABILITY_ACTIVATE, which is
// what lets a reader tell a base's epic action from a leader's. The folded board holds no base
// CARD id to match a SET#NUM against.
describe('SWU-PGN/1.0 generator — a base Epic Action (real game)', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                // Everything that happens must happen IN GAME. Seeding `damage` through
                // setupTestAsync would apply it with no recordable event, and the fold would
                // disagree with the keyframe for reasons that have nothing to do with this test.
                player1: {
                    base: 'tarkintown',              // "Epic Action: Deal 3 damage to a damaged non-leader unit"
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });
        });

        it('records the base Epic Action as spent, against base@N', function () {
            const { context } = contextRef;
            const game: any = context.game;

            expect(context.tarkintown.epicActionSpent).toBe(false);

            // Damage the Wampa in game (3/3 marine into a 4/5 Wampa: the Wampa survives damaged,
            // the marine trades away), so Tarkintown has a legal target.
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
            context.player2.passAction();

            context.player1.clickCard(context.tarkintown);
            context.player1.clickCard(context.wampa);
            expect(context.tarkintown.epicActionSpent).toBe(true);

            context.moveToNextActionPhase();

            const doc = parse(game.getCachedSwuPgn() as string);

            // The base points at itself by seat, not by card id (§6.3).
            const epics = doc.events.filter((e: any) => e.t === 'ABILITY_ACTIVATE' && e.epic) as any[];
            expect(epics.length).toBe(1);
            expect(epics[0].card).toBe('base@1');
            expect(epics[0].p).toBe(1);

            // Spent for seat 1 from that record onward, and never confused with the leader's own
            // Epic Action, which is a different ability on a different card.
            const after = stateAt(doc.events, epics[0].seq);
            expect(after.players[1]?.baseEpicActionUsed).toBe(true);
            expect(after.players[1]?.leader?.epicActionUsed).toBe(false);
            expect(fold(doc.events).players[2]?.baseEpicActionUsed).toBeFalsy();

            // Before the record, unspent — so the flag is driven by the event, not assumed.
            expect(stateAt(doc.events, 'R1.start').players[1]?.baseEpicActionUsed).toBe(false);

            // And every keyframe agrees with the fold.
            const deferred = ['.handSize', '.resourcesReady', '.deckSize', '.hand', '.resources'];
            const real = checkKeyframes(doc.events).mismatches
                .filter((m) => !(m.seq !== 'R1.start' && deferred.some((f) => m.path.endsWith(f))));
            expect(real).toEqual([]);
        });
    });
});
