describe('Tempest Assault', function () {
    integration(function (contextRef) {
        it('Tempest Assault should deal 2 damage to opponent space unit if we dealt damage to opponent base this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tempest-assault'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'stolen-athauler']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();
            context.player1.clickCard(context.tempestAssault);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(2);
            expect(context.stolenAthauler.damage).toBe(2);
            expect(context.awing.damage).toBe(0);
        });

        it('Tempest Assault should not deal 2 damage to opponent space unit if we do not dealt damage to opponent base this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tempest-assault'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['green-squadron-awing', 'stolen-athauler']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.yoda);

            context.player2.passAction();
            context.player1.clickCard(context.tempestAssault);

            expect(context.player1).toHavePrompt('Playing Tempest Assault will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Cancel');
        });

        it('Tempest Assault should not deal 2 damage to opponent space unit if we do dealt damage to our base this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tempest-assault'],
                    groundArena: ['battlefield-marine'],
                    leader: 'anakin-skywalker#what-it-takes-to-win',
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing', 'stolen-athauler']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.anakinSkywalker);
            context.player1.clickPrompt('Deal 2 damage to your base to attack with a unit. If it is attacking a unit, it gets +2 attack for the attack');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();
            context.player1.clickCard(context.tempestAssault);

            expect(context.player1).toHavePrompt('Playing Tempest Assault will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Cancel');
        });

        it('Tempest Assault should deal 2 damage to opponent space unit if we dealt damage to opponent base this phase by an ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tempest-assault'],
                    groundArena: ['sabine-wren#explosives-artist']
                },
                player2: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['green-squadron-awing', 'stolen-athauler']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();
            context.player1.clickCard(context.tempestAssault);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(2);
            expect(context.stolenAthauler.damage).toBe(2);
        });
    });
});