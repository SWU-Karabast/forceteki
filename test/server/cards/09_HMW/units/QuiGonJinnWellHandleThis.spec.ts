describe('Qui-Gon Jinn, We\'ll Handle This', function() {
    integration(function(contextRef) {
        describe('Qui-Gon Jinn\'s when played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['quigon-jinn#well-handle-this', 'change-of-heart', 'waylay'],
                        groundArena: ['battlefield-marine'],
                        resources: 30
                    },
                    player2: {
                        groundArena: ['wampa', 'atst', 'swoop-racer'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        resources: 10
                    }
                });
            });

            it('may defeat a unit that attacked your base this phase', function() {
                const { context } = contextRef;

                // Wampa attacks base
                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // AT-ST attacks a unit, not the base
                context.player1.passAction();
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                // Cartel Spacer attacks base
                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);

                // Boba Fett (leader unit) attacks base
                context.player1.passAction();
                context.player2.clickCard(context.bobaFett);
                context.player2.clickCard(context.p1Base);

                // Swoop Racer does not attack
                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.bobaFett]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('spaceArena');
                expect(context.bobaFett).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('may defeat a space unit that attacked your base this phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('defeats itself if it defeats a leader unit that attacked your base this phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.bobaFett);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.bobaFett]);

                context.player1.clickCard(context.bobaFett);

                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.deployed).toBeFalse();
                expect(context.quigonJinn).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('can be passed', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if no unit attacked your base this phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.quigonJinn);

                expect(context.atst).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('does not count attacks on your base from a previous phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.quigonJinn);

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('does not count attacks on the opponent\'s base', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();
                context.player1.clickCard(context.quigonJinn);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('may defeat a unit that attacked your base and is now under your control', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.controller).toBe(context.player1Object);

                context.player2.passAction();
                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('does not count a unit that left play and was replayed after attacking your base', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');

                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena');

                context.player1.clickCard(context.quigonJinn);

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.quigonJinn).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
