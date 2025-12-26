describe('Director Krennic, On the Verge of Greatness', function() {
    integration(function(contextRef) {
        describe('Krennic\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'qira#i-alone-survived',
                        base: 'echo-base',
                        hand: [
                            'distant-patroller',
                            'superlaser-technician',
                            'roger-roger',
                            'awakened-specters',
                            'crucible#centuries-of-wisdom',
                            'salvage'
                        ],
                        groundArena: ['director-krennic#on-the-verge-of-greatness']
                    },
                    player2: {
                        leader: 'asajj-ventress#i-work-alone',
                        hand: ['onyx-squadron-brute', 'waylay', 'vanquish']
                    }
                });
            });

            it('reduces the cost of the first unit with a \'when defeated\' ability by 1', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not reduce the cost of the second unit with a \'when defeated\' ability by 1', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.superlaserTechnician);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('resets its limit with the phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.superlaserTechnician);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('does not count opponent\'s units with "when defeated" abilities', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.onyxSquadronBrute);
                expect(context.player2.exhaustedResourceCount).toBe(2);

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not count upgrades with "when defeated" abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rogerRoger);
                context.player1.clickCard(context.directorKrennic);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('does not count units without "when defeated" abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.awakenedSpecters);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('works on units that have one ability with multiple trigger types including "when defeated"', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.crucible);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('does not discount a card that is played a second time after being returned to hand', function() {
                const { context } = contextRef;

                // Gets the discount the first time it is played
                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // P2 returns it to P1's hand
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.distantPatroller);

                // It does not get the discount the second time it is played
                context.player1.clickCard(context.distantPatroller);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('does not discount a card that is played from discard after being defeated', function() {
                const { context } = contextRef;

                // Gets the discount the first time it is played
                context.player1.clickCard(context.crucible);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                // P2 defeats it
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.crucible);
                expect(context.crucible).toBeInZone('discard');

                // P1 plays it again from discard with Salvage, no discount this time
                context.player1.clickCard(context.salvage);
                context.player1.clickCard(context.crucible);
                expect(context.player1.exhaustedResourceCount).toBe(11);
            });
        });

        it('Krennic\'s constant ability does not work if the first unit with a "when defeated" ability was played prior to himself', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'qira#i-alone-survived',
                    base: 'tarkintown',
                    hand: [
                        'distant-patroller',
                        'rhokai-gunship',
                        'director-krennic#on-the-verge-of-greatness'
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.distantPatroller);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            context.player2.passAction();

            context.player1.clickCard(context.directorKrennic);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player2.passAction();

            context.player1.clickCard(context.rhokaiGunship);
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });
    });
});
