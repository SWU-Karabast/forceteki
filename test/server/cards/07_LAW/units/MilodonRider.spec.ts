describe('Milodon Rider', function() {
    integration(function(contextRef) {
        describe('Milodon Rider\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['milodon-rider'],
                        groundArena: ['pyke-sentinel'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    },
                    player2: {
                        hand: ['entrenched'],
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });
            });

            it('can be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.milodonRider);
                context.player1.clickPrompt('Return another friendly non-leader unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
                context.player1.clickPrompt('Pass');
                context.player1.clickPrompt('Pass');
                expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);
            });

            it('should allow the player to select a friendly unit to return to hand and should remove damage and be playable', function () {
                const { context } = contextRef;

                context.setDamage(context.pykeSentinel, 2);

                context.player1.passAction();
                context.player2.clickCard('entrenched'); // Providing ownership
                context.player2.clickCard(context.pykeSentinel);

                context.player1.clickCard(context.milodonRider);
                context.player1.clickPrompt('Return another friendly non-leader unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.entrenched).toBeInZone('discard', context.player2);
                context.player1.clickPrompt('Pass');

                context.player2.passAction();
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.damage).toBe(0); // Just making sure that the damage is not added back
                expect(context.pykeSentinel.isUpgraded()).toBe(false);

                expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);
                expect(context.pykeSentinel.exhausted).toBe(true); // Does not retain state when returned to hand
            });
        });
    });
});
