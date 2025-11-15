describe('Cost adjuster combinations', function() {
    integration(function (contextRef) {
        describe('Exploit + Starhawk:', function () {
            // beforeEach(function () {
            //     return contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['hailfire-tank'],
            //             spaceArena: ['the-starhawk#prototype-battleship'],
            //             groundArena: ['battle-droid', 'clone-trooper']
            //         }
            //     });
            // });

            it('Starhawk cost adjustment should not trigger at pay time if it is exploited away', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.hailfireTank).toBeInZone('groundArena');
            });

            it('opportunity cost for exploiting Starhawk should be calculated correctly (unit cannot be played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.hailfireTank);
            });

            it('optimal play cost should be computed correctly and triggered', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelect(context.hailfireTank);
                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
            });
        });

        describe('Exploit + Vuutun Palaa:', function () {
            // beforeEach(function () {
            //     return contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['hailfire-tank'],
            //             spaceArena: ['the-starhawk#prototype-battleship'],
            //             groundArena: ['battle-droid', 'clone-trooper']
            //         }
            //     });
            // });

            // it('Vuutun Palaa cost adjustment should not trigger at pay time if it is exploited away', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['hailfire-tank'],
            //             spaceArena: ['vuutun-palaa#droid-control-ship'],
            //             groundArena: ['battle-droid', 'separatist-commando', 'clone-trooper']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.hailfireTank);

            //     context.player1.clickPrompt('Trigger Exploit');
            //     context.player1.clickCard(context.vuutunPalaa);
            //     context.player1.clickCard(context.cloneTrooper);
            //     context.player1.clickPrompt('Done');

            //     expect(context.player1.exhaustedResourceCount).toBe(4);
            //     expect(context.hailfireTank).toBeInZone('groundArena');
            // });

            // it('opportunity cost for exploiting Starhawk should be calculated correctly (unit cannot be played)', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['hailfire-tank'],
            //             spaceArena: ['the-starhawk#prototype-battleship'],
            //             groundArena: ['battle-droid'],
            //             resources: 2
            //         }
            //     });

            //     const { context } = contextRef;

            //     expect(context.player1).not.toBeAbleToSelect(context.hailfireTank);
            // });

            it('optimal play cost should be computed correctly and triggered', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'separatist-commando', 'clone-trooper'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelect(context.hailfireTank);
                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.separatistCommando, context.battleDroid]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.battleDroid]);
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                context.player1.clickPrompt('Pay cost by exhausting units');
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.separatistCommando]);
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
            });
        });
    });
});
