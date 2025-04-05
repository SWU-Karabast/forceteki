describe('Waylay', function() {
    integration(function(contextRef) {
        describe('Waylay\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['waylay', 'waylay'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        hand: ['entrenched'],
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });
            });

            it('can return a friendly or enemy unit to its owner\'s hand', function () {
                const { context } = contextRef;

                context.player1.clickCard('waylay');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.imperialInterceptor, context.superlaserTechnician]);

                context.player1.clickCard(context.superlaserTechnician);
                expect(context.superlaserTechnician).toBeInZone('hand', context.player2);
            });

            it('should allow the player to select a friendly unit to return to hand and should remove damage and be playable', function () {
                const { context } = contextRef;

                context.setDamage(context.pykeSentinel, 2);

                context.player1.passAction();
                context.player2.clickCard('entrenched'); // Providing ownership
                context.player2.clickCard(context.pykeSentinel);

                context.player1.clickCard('waylay');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.superlaserTechnician, context.imperialInterceptor]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.entrenched).toBeInZone('discard', context.player2);

                context.player2.passAction();
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.damage).toBe(0); // Just making sure that the damage is not added back
                expect(context.pykeSentinel.isUpgraded()).toBe(false);

                expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);
                expect(context.pykeSentinel.exhausted).toBe(true); // Does not retain state when returned to hand
            });
        });

        it('cannot return an enemy unit with a leader attached to it to it\'s owner\'s hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'boba-fett#any-methods-necessary',
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer'],
                    resources: 6
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['pyke-sentinel'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFett);
            context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
            context.player1.clickCard(context.cartelSpacer);
            context.player1.setDistributeDamagePromptState(new Map([]));

            context.player2.clickCard('waylay');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);

            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('hand');
        });
    });
});
