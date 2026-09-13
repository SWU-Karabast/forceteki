describe('Dooku, Corruption Must Be Eradicated', function() {
    integration(function(contextRef) {
        it('should ready another unit and heals damage from a base equal to that unit\'s cost', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dooku#corruption-must-be-eradicated'],
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dooku);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.exhausted).toBeFalse();

            expect(context.player1).toHavePrompt('Heal 4 damage from a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(6);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not heal base if no unit to ready', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dooku#corruption-must-be-eradicated'],
                    groundArena: ['wampa'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dooku);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(10);
        });

        it('should not select not ready-able unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dooku#corruption-must-be-eradicated'],
                    groundArena: ['wampa'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    hand: ['no-good-to-me-dead'],
                    groundArena: [{ card: 'atst', exhausted: true }],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGoodToMeDead);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.dooku);
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.p1Base.damage).toBe(10 - context.atst.cost);
        });
    });
});
