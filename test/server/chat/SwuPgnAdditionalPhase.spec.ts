import { parse, validate } from '../../../swupgn/src/index';

describe('SWU-PGN/1.0 recorder: an additional phase in the same round', function () {
    integration(function (contextRef) {
        // Value: protects=a phase a card grants in the same round gets seqs of its own, so the file stays valid (spec §9 seq uniqueness); fails_when=the recorder restarts the phase's counters under the same phase letter and reuses R1.G.start, R1.G.1 and on; why_new=no spec played a game with an additional phase; seam=none; no_claim=an additional action phase
        it('numbers Max Rebo\'s additional regroup phase apart from the first', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sly-moore#cipher-in-the-dark',
                    base: 'data-vault',
                    resources: 5,
                    hand: ['max-rebo#encore'],
                    deck: ['air-superiority', 'beguile', 'choose-sides', 'daring-raid', 'eject', 'face-off'],
                },
                player2: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    base: 'data-vault',
                    resources: 5,
                    deck: ['apology-accepted', 'budget-scheming', 'change-of-heart', 'death-field', 'evacuate', 'fly-casual'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.maxRebo);
            context.moveToRegroupPhase();
            context.player1.clickDone();
            context.player2.clickDone();
            expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
            context.player1.clickDone();
            context.player2.clickDone();
            expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');

            const file: string = context.game.getCachedSwuPgn();
            const events = parse(file).events;
            const regroupStarts = events.filter((e) => e.t === 'PHASE_START' && e.phase === 'regroup').map((e) => e.seq);
            expect(regroupStarts).toEqual(['R1.G.start', jasmine.stringMatching(/^R1\.G\.\d+$/)]);
            const seqs = events.map((e) => e.seq);
            const repeated = seqs.filter((seq, i) => seqs.indexOf(seq) !== i);
            expect(repeated).toEqual([]);
            expect(validate(file).issues.filter((i) => i.severity === 'error')).toEqual([]);
        });
    });
});
