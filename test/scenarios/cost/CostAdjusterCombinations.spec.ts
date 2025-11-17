describe('Cost adjuster combinations', function() {
    integration(function (contextRef) {
        describe('Exploit + Starhawk:', function () {
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

            it('opportunity cost for exploiting Starhawk should be calculated correctly (unit can be played by exploiting Starhawk)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['asajj-ventress#count-dookus-assassin'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid']
                    }
                });

                const { context } = contextRef;

                context.player1.setExactReadyResources(0);
                expect(context.player1).toBeAbleToSelect(context.asajjVentressCountDookusAssassin);
                context.player1.clickCard(context.asajjVentressCountDookusAssassin);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.theStarhawk]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.theStarhawk);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.asajjVentressCountDookusAssassin).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.theStarhawk).toBeInZone('discard');
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

            it('non-optimal play cost should be allowed and minimum required targets updated at trigger time based on selections', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['separatist-super-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelect(context.separatistSuperTank);
                context.player1.clickCard(context.separatistSuperTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.cloneTrooper, context.theStarhawk]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // optimal path: select the two ground units and confirm that we could click done
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path: unselect both, select starhawk and one ground unit, we should not be done yet
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.separatistSuperTank).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.theStarhawk).toBeInZone('discard');
            });

            it('Starhawk discount should be computed correctly for an odd number of resources (card is not playable)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['separatist-super-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // due to aspect cost we can't pay for it
                expect(context.player1).not.toBeAbleToSelect(context.separatistSuperTank);
            });

            it('optimal play cost should be computed correctly and triggered (with aspect penalty)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#worth-the-risk',
                        hand: ['hailfire-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid'],
                        resources: 4
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

            it('other cost adjustments should be correctly accounted for', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['separatist-super-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['gnk-power-droid'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // attack with GNK to get the discount
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                expect(context.player1).toBeAbleToSelect(context.separatistSuperTank);
                context.player1.clickCard(context.separatistSuperTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.gnkPowerDroid]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.separatistSuperTank).toBeInZone('groundArena');
                expect(context.gnkPowerDroid).toBeInZone('discard');
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
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // unselect battle droid to confirm that target filtering updates correctly
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.separatistCommando, context.battleDroid]);
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickPrompt('Done');

                context.player1.clickPrompt('Pay cost by exhausting units');
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.separatistCommando).toBeInZone('discard');
                expect(context.battleDroid.exhausted).toBeTrue();
            });
        });
    });
});
