describe('Razor Crest, Ride For Hire', function () {
    integration(function (contextRef) {
        describe('', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['independent-smuggler', 'smuggling-compartement'],
                        spaceArena: ['razor-crest#ride-for-hire'],
                        groundArena: ['battlefield-marine', 'wampa']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', exhausted: true }, { card: 'consular-security-force', exhausted: true }]
                    }
                });
            });

            it('Razor Crest\'s ability should return to hand when a pilot upgrade is played on it a 2 cost unit or an exhausted 4 cost unit on its owner\'s hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.razorCrest);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce).toBeInZone('hand');
            });

            it('Razor Crest\'s ability should not do anything is a non-pilot upgrade is attached ot it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.smugglingComparement);
                context.player1.clickCard(context.razorCrest);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
