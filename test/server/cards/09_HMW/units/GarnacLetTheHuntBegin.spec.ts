describe('Garnac, Let The Hunt Begin', function() {
    integration(function(contextRef) {
        describe('Garnac\'s constant ability', function () {
            it('should have Hidden while an opponent controls a unique unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['garnac#let-the-hunt-begin']
                    },
                    player2: {
                        groundArena: ['rey#skywalker']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.garnac);

                context.player2.clickCard(context.rey);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should gains Hidden when opponent plays a unique unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['garnac#let-the-hunt-begin']
                    },
                    player2: {
                        hand: ['rey#skywalker'],
                        groundArena: ['porg', 'wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.garnac);


                // Garnac does not have Hidden
                context.player2.clickCard(context.porg);
                expect(context.player2).toBeAbleToSelectExactly([context.garnac, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();

                context.player2.clickCard(context.rey);

                context.player1.passAction();

                // Garnac gained Hidden, not attackable anymore
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should not have Hidden while an opponent does not control a unique unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['garnac#let-the-hunt-begin'],
                        groundArena: ['rey#skywalker']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.garnac);

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.garnac, context.rey]);
                context.player2.clickCard(context.p1Base);
            });
        });

        describe('Garnac\'s when attack ends constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['garnac#let-the-hunt-begin', 'wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('when attack ends, can attack with another unit', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.garnac);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('when attack ends (even if he dies), can attack with another unit', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.garnac);
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
