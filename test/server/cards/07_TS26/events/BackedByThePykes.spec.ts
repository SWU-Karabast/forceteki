describe('Backed by the Pykes', function() {
    integration(function(contextRef) {
        it('Backed by the Pykes\'s ability should give an Experience token to a friendly unit and optionally deal damage equal to the number of Experience tokens on friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-the-pykes'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByThePykes);
            expect(context.player1).toHavePrompt('Give an Experience token to a friendly unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            // Experience token should be attached
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

            // Then prompt should appear for damage (optional)
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter, context.wampa, context.cartelSpacer]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
        });

        it('Backed by the Pykes\'s ability should deal damage equal to the total number of Experience tokens on friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-the-pykes'],
                    groundArena: [
                        { card: 'battlefield-marine', upgrades: ['experience'] },
                        { card: 'atst', upgrades: ['experience', 'experience'] }
                    ],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['experience'] }],
                    spaceArena: ['cartel-spacer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByThePykes);
            expect(context.player1).toHavePrompt('Give an Experience token to a friendly unit');
            context.player1.clickCard(context.tielnFighter);

            // Now there are 4 experience tokens on friendly units (1 on marine, 2 on atst, 1 on tieln-fighter)
            expect(context.player1).toHavePrompt('Deal 4 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.tielnFighter, context.wampa, context.cartelSpacer]);
            context.player1.clickCard(context.wampa);

            // Wampa should have 4 damage (but may not be defeated if it has more than 4 HP)
            expect(context.wampa.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
