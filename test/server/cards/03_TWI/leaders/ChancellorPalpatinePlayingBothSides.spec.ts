describe('Chancellor Palpatine, Playing Both Sides', function () {
    integration(function (contextRef) {
        describe('Chancellor Palpatine\'s leader ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        base: { card: 'echo-base', damage: 10 },
                        groundArena: ['battlefield-marine', 'wampa'],
                        hand: ['pyke-sentinel']
                    },
                    player2: {
                        hand: ['vanquish', 'takedown', 'waylay']
                    }
                });
            });

            it('only exhausts if no friendly Heroism unit has died', function () {
                const { context } = contextRef;

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);
                expect(context.player1.hand.length).toBe(1);

                context.moveToNextActionPhase();
                context.player1.passAction();

                // Ensure that a friendly Heroism card returning to hand doesn't trigger the ability
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.batttlefieldMarine);

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);
                expect(context.player1.hand.length).toBe(1);

                context.moveToNextActionPhase();
                context.player1.passAction();

                // Ensure that a friendly non-Heroism card being defeated doesn't trigger the ability
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.wampa);

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);
                expect(context.player1.hand.length).toBe(1);
            });

            it('draws, heals, and flips if a friendly Heroism unit has died', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);

                // Check that Palpatine healed, drew, and flipped
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(8);
                expect(context.player1.hand.length).toBe(2);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
            });
        });

        // describe('Chancellor Palpatine\'s leader ability', function () {
        //     beforeEach(function () {
        //         contextRef.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 leader: { card: 'chancellor-palpatine#playing-both-sides', flipped: true },
        //                 base: { card: 'echo-base', damage: 10 },
        //                 groundArena: ['battlefield-marine', 'wampa'],
        //                 hand: ['pyke-sentinel']
        //             },
        //             player2: {
        //                 hand: ['vanquish', 'takedown', 'waylay']
        //             }
        //         });
        //     });

        //     it('back-side does nothing if no Villainy card was played', function () {
        //         const { context } = contextRef;
        //         expect(context.chancellorPalpatine.onStartingSide).toBe(false);
        //         context.player1.clickCard(context.chancellorPalpatine);
        //         expect(context.chancellorPalpatine.exhausted).toBe(true);
        //     });

        //     it('back-side creates a clone, deals 2 damage to enemy base, and flips if a Villainy card has been played', function () {
        //         const { context } = contextRef;
        //         expect(context.chancellorPalpatine.onStartingSide).toBe(false);

        //         context.player1.clickCard(context.pykeSentinel);
        //         context.player2.passAction();

        //         context.player1.clickCard(context.chancellorPalpatine);
        //         expect(context.chancellorPalpatine.exhausted).toBe(true);
        //         expect(context.p2Base.damage).toBe(2);
        //         expect(context.cloneTrooper).toBeInZone('groundArena', context.player1);
        //     });
        // });
    });
});
