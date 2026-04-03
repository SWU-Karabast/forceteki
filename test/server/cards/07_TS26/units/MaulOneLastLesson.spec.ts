describe('Maul, One Last Lesson', function() {
    integration(function(contextRef) {
        describe('Maul, One Last Lesson\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        hand: ['maul#one-last-lesson', 'sneak-attack']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should allow attacking with another unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maulOneLastLesson);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maulOneLastLesson);

                expect(context.player1).toHavePrompt('Attack with another unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
            });

            it('should not allow Maul to attack immegiately if coming into play ready', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.maulOneLastLesson);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});