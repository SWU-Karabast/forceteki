describe('Rhydonium Detonation\'s ability', function() {
    integration(function(contextRef) {
        describe('with multiple units in play', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rhydonium-detonation'],
                        groundArena: ['wampa', 'battlefield-marine', 'spy']
                    },
                    player2: {
                        groundArena: ['atst', 'consular-security-force'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should allow both players to save a unit, then defeat remaining non-leader units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // P1 chooses first, can select any non-leader unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa, context.battlefieldMarine, context.spy,
                    context.atst, context.consularSecurityForce
                ]);
                context.player1.clickCard(context.wampa);

                // P2 chooses second, all non-leader units still selectable (targets evaluated simultaneously)
                expect(context.player2).toBeAbleToSelectExactly([
                    context.wampa, context.battlefieldMarine, context.spy,
                    context.atst, context.consularSecurityForce
                ]);
                context.player2.clickCard(context.atst);

                // Saved units returned to hand
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.atst).toBeInZone('hand', context.player2);

                // Remaining non-leader units defeated
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
                expect(context.spy).toBeInZone('outsideTheGame'); // Token removed from game

                // Deployed leader is still in play
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
            });

            it('should allow only P1 to save when P2 passes', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // P1 saves a unit
                context.player1.clickCard(context.wampa);

                // P2 passes
                context.player2.clickPrompt('Choose nothing');

                // Only wampa saved
                expect(context.wampa).toBeInZone('hand', context.player1);

                // All other non-leader units defeated
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
                expect(context.spy).toBeInZone('outsideTheGame'); // Token removed from game

                // Leader untouched
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
            });

            it('should allow only P2 to save when P1 passes', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // P1 passes
                context.player1.clickPrompt('Choose nothing');

                // P2 saves a unit
                context.player2.clickCard(context.consularSecurityForce);

                // Only consular security force saved
                expect(context.consularSecurityForce).toBeInZone('hand', context.player2);

                // All other non-leader units defeated
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.spy).toBeInZone('outsideTheGame'); // Token removed from game

                // Leader untouched
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
            });

            it('should defeat all non-leader units when both players pass', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // Both pass
                context.player1.clickPrompt('Choose nothing');
                context.player2.clickPrompt('Choose nothing');

                // All non-leader units defeated
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
                expect(context.spy).toBeInZone('outsideTheGame'); // Token removed from game

                // Leader untouched
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
            });

            it('should allow P1 to save an opponent unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // P1 saves opponent's unit
                context.player1.clickCard(context.atst);

                // P2 selects from all units
                context.player2.clickCard(context.consularSecurityForce);

                // Both saved to owner's hands
                expect(context.atst).toBeInZone('hand', context.player2);
                expect(context.consularSecurityForce).toBeInZone('hand', context.player2);

                // P1's units all defeated
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.spy).toBeInZone('outsideTheGame'); // Token removed from game

                // Leader untouched
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
            });
        });

        describe('edge cases', function() {
            it('should resolve with no effect when no non-leader units are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rhydonium-detonation']
                    },
                    player2: {
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // Player is warned that the event will have no effect
                expect(context.player1).toHavePrompt('Playing Rhydonium Detonation will have no effect. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

                // Play it anyway
                context.player1.clickPrompt('Play anyway');
                expect(context.rhydoniumDetonation).toBeInZone('discard', context.player1);

                // Leader untouched
                expect(context.bobaFett).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow both players to save the only unit in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rhydonium-detonation'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // P1 selects the only unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // P2 can also select wampa (targets evaluated together)
                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickPrompt('Choose nothing');

                // Unit saved, nothing left to defeat
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat the only unit when both players pass', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rhydonium-detonation'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rhydoniumDetonation);

                // Both pass
                context.player1.clickPrompt('Choose nothing');
                context.player2.clickPrompt('Choose nothing');

                // Unit defeated
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
