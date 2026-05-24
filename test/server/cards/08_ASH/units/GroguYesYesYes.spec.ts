describe('Grogu, Yes. Yes. Yes.', function() {
    integration(function(contextRef) {
        it('Grogu\'s ability should attack with a unit after claiming initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes', 'wampa'],
                    spaceArena: [{ card: 'lurking-tie-phantom', exhausted: true }, 'green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.claimInitiative();

            expect(context.player1).toHavePrompt('Attack with a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.grogu, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('Grogu\'s ability should attack with itself after claiming initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes', 'wampa'],
                    spaceArena: [{ card: 'lurking-tie-phantom', exhausted: true }, 'green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.claimInitiative();

            expect(context.player1).toBeAbleToSelectExactly([context.grogu, context.wampa, context.greenSquadronAwing]);
            context.player1.clickCard(context.grogu);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Grogu\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes', 'wampa'],
                    spaceArena: [{ card: 'lurking-tie-phantom', exhausted: true }, 'green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.claimInitiative();

            expect(context.player1).toBeAbleToSelectExactly([context.grogu, context.wampa, context.greenSquadronAwing]);
            context.player1.clickPrompt('Pass');
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Grogu\'s ability should not work if the opponent claims initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes', 'wampa'],
                    spaceArena: [{ card: 'lurking-tie-phantom', exhausted: true }, 'green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.claimInitiative();

            expect(context.player1).not.toHavePrompt('Attack with a unit');
            expect(context.player1).toBeActivePlayer();
        });

        it('Grogu\'s ability should not attack with a unit when both players pass', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes'],
                },
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.passAction();

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1).not.toHavePrompt('Attack with a unit');

            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
        });

        it('Grogu\'s ability should trigger attack when opponent claims initiative while Grogu is under his control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grogu#yes-yes-yes'],
                },
                player2: {
                    hand: ['change-of-heart'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.grogu);
            context.player1.passAction();
            context.player2.claimInitiative();

            expect(context.player2).toBeAbleToSelectExactly([context.grogu]);
            context.player2.clickCard(context.grogu);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
        });
    });
});