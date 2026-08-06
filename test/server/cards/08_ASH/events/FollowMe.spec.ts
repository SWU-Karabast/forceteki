describe('Follow Me', function() {
    integration(function(contextRef) {
        it('should attack with a unit, then give 3 Advantage tokens to a unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['follow-me'],
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.followMe);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.atst]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });

        it('should not give 3 Advantage tokens to a unit if we cannot attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['follow-me'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.followMe);
            expect(context.player1).toHavePrompt('Playing Follow Me will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);
        });

        it('should give 3 Advantage tokens after completing all "When Attack Ends"', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['follow-me'],
                    spaceArena: ['awing'],
                    leader: { card: 'colonel-yularen#this-is-why-we-plan', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.followMe);

            expect(context.player1).toHavePrompt('Attack with a unit. After completing the attack, give 3 Advantage tokens to a unit');
            context.player1.clickCard(context.colonelYularen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Attack with another unit that costs 4 or less');
            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.colonelYularen, context.atst]);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });
    });
});
