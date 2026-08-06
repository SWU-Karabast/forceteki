describe('Millennium Falcon, Yahoo', function () {
    integration(function (contextRef) {
        it('Millennium Falcon\'s ability should pay 1 resource to return a friendly unit that costs 3 or less to its owner\'s hand and play it for free (space unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['millennium-falcon#yahoo', 'awing'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('You may pay 1 resource. If you do, return a friendly unit that costs 3 or less to its owner\'s hand. If it\'s returned to your hand. you may play it for free.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player1).toBeAbleToSelectExactly([context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.awing);

            expect(context.player1).toHavePassAbilityPrompt('Play A-Wing for free');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Millennium Falcon\'s ability should pay 1 resource to return a friendly unit that costs 3 or less to its owner\'s hand and play it for free (ground unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['millennium-falcon#yahoo'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('You may pay 1 resource. If you do, return a friendly unit that costs 3 or less to its owner\'s hand. If it\'s returned to your hand. you may play it for free.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHavePassAbilityPrompt('Play Battlefield Marine for free');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
        });

        it('Millennium Falcon\'s ability should pay 1 resource to return a friendly unit that costs 3 or less to its owner\'s hand and play it for free (stolen unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['traitorous'],
                    spaceArena: ['millennium-falcon#yahoo'],
                    base: 'data-vault'
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.traitorous);
            context.player1.clickCard(context.yoda);

            context.player2.passAction();

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('You may pay 1 resource. If you do, return a friendly unit that costs 3 or less to its owner\'s hand. If it\'s returned to your hand. you may play it for free.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1.exhaustedResourceCount).toBe(6);

            expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toBeInZone('hand', context.player2);
        });

        it('Millennium Falcon\'s ability should not be available if the player doesn\'t have enough resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['millennium-falcon#yahoo'],
                    resources: 0
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('Millennium Falcon\'s ability should not be available if the player doesn\'t have enough ready resources to pay', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['millennium-falcon#yahoo'],
                },
            });

            const { context } = contextRef;

            context.player1.exhaustResources(context.player1.readyResourceCount);

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('Millennium Falcon\'s ability should not ask to pay if nothing to return to hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['millennium-falcon#yahoo'],
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
