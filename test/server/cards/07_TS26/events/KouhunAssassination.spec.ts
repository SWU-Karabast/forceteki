describe('Kouhun Assassination', function() {
    integration(function(contextRef) {
        describe('Kouhun Assassination\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kouhun-assassination'],
                        groundArena: ['wampa', 'consular-security-force']
                    },
                    player2: {
                        hand: ['battlefield-marine', 'vanquish'],
                        groundArena: ['mythosaur#folklore-awakened', 'atst'],
                        spaceArena: ['tie-fighter']
                    }
                });
            });

            it('should give -8/-8 to a non-Vehicle unit if opponent discards a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kouhunAssassination);

                expect(context.player2).toHavePrompt('Choose a card to discard for Kouhun Assassination\'s effect');
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.vanquish]);
                expect(context.player2).toHaveChooseNothingButton();

                context.player2.clickCard(context.vanquish);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce, context.mythosaur]);
                context.player1.clickCard(context.mythosaur);

                expect(context.player2).toBeActivePlayer();
                expect(context.mythosaur.getPower()).toBe(2);
                expect(context.mythosaur.getHp()).toBe(2);

                context.moveToNextActionPhase();

                expect(context.mythosaur.getPower()).toBe(10);
                expect(context.mythosaur.getHp()).toBe(10);
            });

            it('should not give -8/-8 if opponent chooses not to discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kouhunAssassination);
                context.player2.clickPrompt('Choose nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.mythosaur.getPower()).toBe(10);
                expect(context.mythosaur.getHp()).toBe(10);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);
            });
        });

        it('should not work when opponent has no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kouhun-assassination'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['snowtrooper-lieutenant']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kouhunAssassination);

            expect(context.player2).toBeActivePlayer();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(context.snowtrooperLieutenant.getPower()).toBe(2);
            expect(context.snowtrooperLieutenant.getHp()).toBe(2);
        });

        it('should not work when there are only Vehicle units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kouhun-assassination'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kouhunAssassination);
            context.player2.clickCard(context.vanquish);

            expect(context.player2).toBeActivePlayer();

            expect(context.awing.getPower()).toBe(1);
            expect(context.awing.getHp()).toBe(2);
            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
        });
    });
});
