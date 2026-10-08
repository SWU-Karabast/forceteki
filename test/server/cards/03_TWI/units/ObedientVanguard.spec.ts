describe('Obedient Vanguard', function () {
    integration(function (contextRef) {
        describe('Obedient Vanguard\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['obedient-vanguard', 'battlefield-marine', 'wampa']
                    },
                    player2: {
                        groundArena: ['atst', 'wilderness-fighter'],
                    }
                });
            });

            it('should give +2/+2 to a trooper unit when defeated', function () {
                const { context } = contextRef;

                // obedient vanguard attack : nothing happen
                context.player1.clickCard(context.obedientVanguard);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();

                // atst kill obedient vanguard, player1 can choose a trooper unit to give +2/+2 for this phase
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.obedientVanguard);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        it('should let the new controller choose the Trooper unit when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['obedient-vanguard', 'battlefield-marine', 'wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['atst', 'wilderness-fighter'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            const wildernessFighterPower = context.wildernessFighter.getPower();
            const wildernessFighterHp = context.wildernessFighter.getHp();

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.obedientVanguard);

            // Player 2 controlled the Vanguard when it was defeated, so they resolve the When Defeated ability
            expect(context.obedientVanguard).toBeInZone('discard', context.player1);
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wildernessFighter);
            expect(context.wildernessFighter.getPower()).toBe(wildernessFighterPower + 2);
            expect(context.wildernessFighter.getHp()).toBe(wildernessFighterHp + 2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
