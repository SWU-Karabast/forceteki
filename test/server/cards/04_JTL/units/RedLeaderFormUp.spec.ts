describe('Red Leader, Form Up', function() {
    integration(function(contextRef) {
        it('Red Leader\'s ability should decrease cost by 1 for each friendly Pilot unit or friendly Pilot upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['independent-smuggler', 'red-leader#form-up'],
                    groundArena: ['hera-syndulla#weve-lost-enough', 'wampa'],
                    spaceArena: ['green-squadron-awing'],
                    base: 'petranaki-arena',
                    leader: 'wedge-antilles#leader-of-red-squadron'
                },
                player2: {
                    groundArena: ['darth-vader#scourge-of-squadrons']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.independentSmuggler);
            context.player1.clickPrompt('Play Independent Smuggler with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.redLeader);

            expect(context.player2).toBeActivePlayer();
            // independent smuggler cost 1 and red leader should have cost 2 because there is 2 friendly pilots (unit or upgrade)
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        describe('Red Leader\'s ability', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['independent-smuggler'],
                        spaceArena: ['red-leader#form-up', 'survivors-gauntlet'],
                    },
                });
            });

            it('should create a xwing token when a pilot upgrade is played on it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.redLeader);

                expect(context.player2).toBeActivePlayer();

                const xwing = context.player1.findCardByName('xwing');
                expect(xwing.exhausted).toBeTrue();
            });

            it('should create a xwing token when a pilot upgrade is attached to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.survivorsGauntlet);

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickCard(context.redLeader);

                expect(context.player2).toBeActivePlayer();

                const xwing = context.player1.findCardByName('xwing');
                expect(xwing.exhausted).toBeTrue();
            });
        });
    });
});
