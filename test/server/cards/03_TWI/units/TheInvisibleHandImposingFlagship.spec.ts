describe('The Invisible Hand Imposing Flagship\'s ability', function() {
    integration(function(contextRef) {
        it('should create 4 battle droid tokens when played and it can exhaust separatist units on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-invisible-hand#imposing-flagship', 'obedient-vanguard'],
                    groundArena: ['warrior-drone'],
                    spaceArena: ['vanguard-droid-bomber']
                },
                player2: {
                    groundArena: ['droid-commando'],
                    spaceArena: ['devastating-gunship']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.theInvisibleHand);
            const battleDroidTokens = context.player1.findCardsByName('battle-droid');
            expect(battleDroidTokens.length).toBe(4);

            context.moveToNextActionPhase();
            expect(battleDroidTokens.every((token) => !token.exhausted)).toBeTrue();
            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.player2.base);
            expect(context.player1).toBeAbleToSelectExactly([
                battleDroidTokens[0],
                battleDroidTokens[1],
                battleDroidTokens[2],
                battleDroidTokens[3],
                context.warriorDrone,
                context.vanguardDroidBomber
            ]);
            context.player1.clickPrompt('Pass');
            expect(battleDroidTokens.every((token) => !token.exhausted)).toBeTrue();
            expect(context.warriorDrone.exhausted).toBe(false);
            expect(context.vanguardDroidBomber.exhausted).toBe(false);
            expect(context.droidCommando.exhausted).toBe(false);
            expect(context.devastatingGunship.exhausted).toBe(false);
            expect(context.player2.base.damage).toBe(4);

            context.moveToNextActionPhase();
            context.player1.clickCard(battleDroidTokens[0]);
            context.player1.clickCard(context.player2.base);
            expect(battleDroidTokens[0].exhausted).toBe(true);
            expect(context.player2.base.damage).toBe(5);
            context.player2.passAction();

            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.player2.base);
            expect(context.player1).toBeAbleToSelectExactly([
                battleDroidTokens[1],
                battleDroidTokens[2],
                battleDroidTokens[3],
                context.warriorDrone,
                context.vanguardDroidBomber
            ]);
            context.player1.clickCard(battleDroidTokens[1]);
            context.player1.clickCard(battleDroidTokens[2]);
            context.player1.clickCard(context.vanguardDroidBomber);
            context.player1.clickPrompt('Done');
            expect(battleDroidTokens[1].exhausted).toBe(true);
            expect(battleDroidTokens[2].exhausted).toBe(true);
            expect(context.vanguardDroidBomber.exhausted).toBe(true);
            expect(battleDroidTokens[3].exhausted).toBe(false);
            expect(context.warriorDrone.exhausted).toBe(false);

            expect(context.player2.base.damage).toBe(12);
        });
    });
});
