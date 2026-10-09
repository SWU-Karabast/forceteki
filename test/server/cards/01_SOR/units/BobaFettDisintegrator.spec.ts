describe('Boba Fett, Disintegrator', function() {
    integration(function(contextRef) {
        describe('Boba Fett, Disintegrator\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vambrace-grappleshot'],
                        groundArena: ['boba-fett#disintegrator'],
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['lom-pyke#dealer-in-truths', 'consular-security-force', 'entrenched'],
                    }
                });
            });

            it('while attacking an exhausted unit that didn\'t enter play this round, should deal 3 damage to the defender', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.setDamage(context.bobaFett, 0);
                    context.readyCard(context.bobaFett);
                    context.setDamage(context.consularSecurityForce, 0);
                    context.readyCard(context.consularSecurityForce);
                };
                // Case 1 attacking a ready card
                context.player1.passAction();
                context.player2.clickCard(context.consularSecurityForce);
                context.player1.passAction();

                context.player2.clickCard(context.lukeSkywalker);
                context.player2.clickPrompt('Deploy Luke Skywalker');
                context.moveToNextActionPhase();

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.consularSecurityForce);

                // check board state
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.bobaFett.damage).toBe(3);

                // reset board state
                reset();

                // Case 2 attacking a card played this turn
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.lomPyke);
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.lomPyke);

                // check board state
                expect(context.player2).toBeActivePlayer();
                expect(context.lomPyke.damage).toBe(3);
                expect(context.bobaFett.damage).toBe(4);

                // reset state
                reset();

                // Case 3 Ability activates when attacking an exhausted unit not played in this phase
                context.exhaustCard(context.consularSecurityForce);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.consularSecurityForce);

                // check board state
                expect(context.bobaFett.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);

                // reset state
                reset();

                context.player2.passAction();

                // Case 4 Ability should activate when attacking leader deployed previous phase
                // TODO QIRA The card enteres play event doesn't handle leader deployment correctly so we need to wait for the fix before uncommenting this test.
                /* context.exhaustCard(context.lukeSkywalker);
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.lukeSkywalker);

                // check board state
                expect(context.lukeSkywalker.damage).toBe(6);
                expect(context.bobaFett.damage).toBe(4);*/

                // Case 5 Ability shouldn't activate when selecting BobaFett's ability first.
                context.player1.clickCard(context.vambraceGrappleshot);
                context.player1.clickCard(context.bobaFett);
                context.player2.passAction();

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickPrompt('(No effect) If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.');

                // check game state
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.consularSecurityForce.exhausted).toBe(true);

                // reset state
                reset();

                // Case 6 Ability should activate when selecting vambrace-grappleshots ability before Boba Fetts.
                context.player2.clickCard(context.entrenched);
                context.player2.clickCard(context.consularSecurityForce);

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickPrompt('Exhaust the defender on attack');

                // check game state
                expect(context.consularSecurityForce.damage).toBe(8);
            });
        });

        describe('Boba Fett, Disintegrator\'s ability, when attacking a unit rescued from being captured', function () {
            it('should not deal 3 damage to an exhausted unit that was captured in a previous round and rescued this round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive'],
                        groundArena: ['boba-fett#disintegrator', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['wampa'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Round 1: player2 plays Wampa and player1 captures it with Battlefield Marine
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player2);

                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);

                // Round 2: player2 defeats the guard, rescuing Wampa, which enters play again exhausted
                context.moveToNextActionPhase();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();

                // Wampa entered play this round, so Boba's ability doesn't deal the extra 3 damage
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(3);
                expect(context.bobaFett.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});