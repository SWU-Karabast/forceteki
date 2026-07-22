describe('Paz Vizsla, For a Brighter Future', function() {
    integration(function(contextRef) {
        describe('When Defeated ability', function() {
            it('should not create 2 Mandalorian tokens when defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'paz-vizsla#for-a-brighter-future'],
                    },
                    player2: {
                        groundArena: ['sontuul-berserkers']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.pazVizslaForABrighterFuture);
                context.player1.clickCard(context.sontuulBerserkers);

                expect(context.pazVizslaForABrighterFuture).toBeInZone('discard');
                const mandalorians = context.player1.findCardsByName('mandalorian');

                expect(mandalorians.length).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should make 2 Mandalorian tokens when not defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'paz-vizsla#for-a-brighter-future'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.pazVizslaForABrighterFuture);
                context.player1.clickPrompt('Resolve all remaining (2)');

                const mandalorians = context.player1.findCardsByName('mandalorian');

                expect(mandalorians.length).toBe(2);
                expect(mandalorians).toAllBeInZone('groundArena');
                expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

                expect(context.player1).toBeActivePlayer();
            });

            it('should give the player of NGOR when defeated by NGOR', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'paz-vizsla#for-a-brighter-future'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa'],
                        resources: 10,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.pazVizslaForABrighterFuture);
                context.player2.clickPrompt('Resolve all remaining (2)');

                const mandaloriansP1 = context.player1.findCardsByName('mandalorian');

                expect(mandaloriansP1.length).toBe(0);

                const mandaloriansP2 = context.player2.findCardsByName('mandalorian');

                expect(mandaloriansP2.length).toBe(2);
                expect(mandaloriansP2).toAllBeInZone('groundArena');
                expect(mandaloriansP2.every((m) => m.exhausted)).toBeTrue();

                expect(context.player1).toBeActivePlayer();
            });

            it('should create Mandalorian tokens if killed by on attack ping', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', { card: 'paz-vizsla#for-a-brighter-future', damage: 6 }],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['sabine-wren#explosives-artist'],
                        resources: 10,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.pazVizslaForABrighterFuture);
                context.player2.clickCard(context.pazVizslaForABrighterFuture);
                context.player1.clickPrompt('Resolve all remaining (2)');

                const mandalorians = context.player1.findCardsByName('mandalorian');

                expect(mandalorians.length).toBe(2);
                expect(mandalorians).toAllBeInZone('groundArena');
                expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});