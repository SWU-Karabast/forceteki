describe('The Clone Wars ability\'s', function() {
    integration(function(contextRef) {
        it('allow to pay any number of resources and to create clone trooper token. Opponent create the same number of battle droid token', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-clone-wars'],
                    resources: 6,
                    base: 'echo-base',
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theCloneWars);
            expect(context.player1.readyResourceCount).toBe(4);
            expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 4 + 1 }, (x, i) => `${i}`));
            context.player1.chooseListOption('2');
            expect(context.player1.readyResourceCount).toBe(2);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(cloneTroopers.length).toBe(2);
            expect(battleDroids.length).toBe(2);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
        });

        it('allow to pay 0 resource and it should not create any Trooper Token or Battle Droid Token', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-clone-wars'],
                    resources: 8,
                    base: 'echo-base',
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theCloneWars);
            expect(context.player1.readyResourceCount).toBe(6);
            expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 6 + 1 }, (x, i) => `${i}`));
            context.player1.chooseListOption('0');
            expect(context.player1.readyResourceCount).toBe(6);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(cloneTroopers.length).toBe(0);
            expect(battleDroids.length).toBe(0);
        });

        it('pass if there are no resources available', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-clone-wars'],
                    resources: 2,
                    base: 'echo-base',
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theCloneWars);
            expect(context.player1.readyResourceCount).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
