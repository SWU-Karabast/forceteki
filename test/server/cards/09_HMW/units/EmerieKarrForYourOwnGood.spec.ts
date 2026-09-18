describe('Emerie Karr, For Your Own Good', function() {
    integration(function(contextRef) {
        it('Emerie Karr\'s ability should deal 1 damage to a friendly ground unit and reduce the next unit\'s cost by 1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emerie-karr#for-your-own-good', 'rebel-pathfinder'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['criminal-muscle'],
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emerieKarr);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.clickCard(context.criminalMuscle);
            // does not discount for opponent
            expect(context.player2.exhaustedResourceCount).toBe(1);

            context.player1.clickCard(context.rebelPathfinder);
            // 1 for Emerie and 2 - 1 for Rebel Pathfinder = 2 total
            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Emerie Karr\'s ability should deal 1 damage to an enemy ground unit and not reduce the next unit\'s cost by 1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emerie-karr#for-your-own-good', 'rebel-pathfinder'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['criminal-muscle'],
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emerieKarr);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.gungi);

            context.player2.clickCard(context.criminalMuscle);
            // does not discount for opponent
            expect(context.player2.exhaustedResourceCount).toBe(1);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.gungi.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Emerie Karr\'s ability should deal 1 damage to a friendly ground unit and not discount events', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emerie-karr#for-your-own-good', 'daring-raid'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['criminal-muscle'],
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emerieKarr);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.clickCard(context.criminalMuscle);
            // does not discount for opponent
            expect(context.player2.exhaustedResourceCount).toBe(1);

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);
            // 1 for Emerie and 3 for Daring Raid = 4 total
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Emerie Karr\'s ability should not discount if damage is passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emerie-karr#for-your-own-good', 'rebel-pathfinder'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['criminal-muscle'],
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emerieKarr);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.criminalMuscle);
            // does not discount for opponent
            expect(context.player2.exhaustedResourceCount).toBe(1);

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('Emerie Karr\'s ability should deal 1 damage to a friendly ground unit and lose the discount if the action phase moves', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emerie-karr#for-your-own-good', 'rebel-pathfinder'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['criminal-muscle'],
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emerieKarr);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
