describe('Mon Mothma, Clinging to Hope', function () {
    integration(function (contextRef) {
        describe('Mon Mothma\'s ability', function () {
            it('should allow attacking with any number of exhausted units, one at the time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#clinging-to-hope'],
                        groundArena: ['atst', { card: 'wampa', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true }
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);

                // Attack with Wampa
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.theMandalorian, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);

                // Attack with The Mandalorian
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.theMandalorian]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.theMandalorian);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.theMandalorian.exhausted).toBe(true);
                expect(context.consularSecurityForce).toBeInZone('discard');
                expect(context.theMandalorian.damage).toBe(3);

                // AT-ST has no valid target to attack
                expect(context.player2).toBeActivePlayer();
            });

            it('can pass the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#clinging-to-hope'],
                        groundArena: ['atst', { card: 'wampa', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true }
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);

                expect(context.player1).toHavePrompt('Attack with a unit even if it is exhausted. It can\'t attack bases for this attack');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.theMandalorian, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
