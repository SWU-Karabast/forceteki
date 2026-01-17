describe('Cost adjuster combinations', function() {
    integration(function (contextRef) {
        describe('Decrease costs + Credits:', function () {
            it('does not trigger credits when the decrease results in zero cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                        base: 'chopper-base',
                        credits: 3,
                        resources: 7,
                        hand: ['kelleran-beq#the-sabered-hand'],
                        deck: ['r2d2#full-of-solutions']
                    }
                });

                const { context } = contextRef;

                // Play Kelleran Beq (without using Credits)
                context.player1.clickCard(context.kelleranBeq);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // Kelleran's ability triggers, allowing us to play R2-D2 for 3 less
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.r2d2],
                    invalid: []
                });
                context.player1.clickCardInDisplayCardPrompt(context.r2d2);

                // No prompt for credits should appear, as R2-D2 costs 0 after the discount
                expect(context.r2d2).toBeInZone('groundArena', context.player1);
                expect(context.player1.credits).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('does trigger when the decrease does not reduce cost to zero', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                        credits: 3,
                        resources: 7,
                        hand: ['kelleran-beq#the-sabered-hand'],
                        deck: ['captain-typho#all-necessary-precautions']
                    }
                });

                const { context } = contextRef;

                // Play Kelleran Beq (without using Credits)
                context.player1.clickCard(context.kelleranBeq);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // Kelleran's ability triggers, allowing us to play Captain Typho for 3 less
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.captainTypho],
                    invalid: []
                });
                context.player1.clickCardInDisplayCardPrompt(context.captainTypho);

                // Prompt for credits should appear, as Captain Typho costs 1 after the discount
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Captain Typho');
                expect(context.player1).toHaveExactPromptButtons(['Use 1 Credit']);
                context.player1.clickPrompt('Use 1 Credit');

                // Verify final state
                expect(context.captainTypho).toBeInZone('groundArena', context.player1);
                expect(context.player1.credits).toBe(2); // 1 credit used
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Free + Credits:', function () {
            it('does not trigger credits when the cost free', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: { card: 'chopper-base', damage: 28 },
                        credits: 3,
                        resources: 5,
                        hand: ['youre-my-only-hope'],
                        deck: ['krayt-dragon']
                    }
                });

                const { context } = contextRef;

                // Play You're My Only Hope (without using Credits)
                context.player1.clickCard(context.youreMyOnlyHope);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // Play Krayt Dragon for free
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.kraytDragon]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play for free', 'Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.kraytDragon.title);
                context.player1.clickDisplayCardPromptButton(context.kraytDragon.uuid, 'play-free');

                // No prompt for credits, verify final state
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.credits).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(3); // YMOH cost
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Ignore all aspects + Credits:', function () {
            it('applies correct discount for credits when ignoring all aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'kestro-city',
                        credits: 4,
                        resources: 3,
                        hand: ['captain-rex#lead-by-example']
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that Captain Rex is playable
                expect(context.player1).toBeAbleToSelect(context.captainRex);
                context.player1.clickCard(context.captainRex);

                // Prompt to use credits
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Captain Rex');
                expect(context.player1).toHaveExactPromptButtons(['Select amount', 'Cancel']);
                context.player1.clickPrompt('Select amount');

                // He costs 6 after ignoring all aspects, so must use 3 or 4 credits
                expect(context.player1).toHavePrompt('Select amount of Credit tokens');
                expect(context.player1).toHaveExactDropdownListOptions(['3', '4']);
                context.player1.chooseListOption('4');

                // Verify final state
                expect(context.captainRex).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        describe('Exploit + Credits:', function () {
            it('triggers exploit first, and applies correct discount for credits', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 2,
                        resources: 3,
                        hand: ['battle-droid-legion'],
                        groundArena: ['pyke-sentinel', 'imperial-dark-trooper'],
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that Battle Droid Legion is playable
                // 9 cost unit with Exploit 2 (need 5 combined resources or Credits after Exploit)
                expect(context.player1).toBeAbleToSelect(context.battleDroidLegion);
                context.player1.clickCard(context.battleDroidLegion);

                // Exploit is triggered first
                expect(context.player1).toHaveExactPromptButtons(['Trigger Exploit', 'Cancel']);
                context.player1.clickPrompt('Trigger Exploit');

                // Must select both units to cover full cost
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.imperialDarkTrooper]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.imperialDarkTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Must use 2 credits to be able to cover full cost
                expect(context.player1).toHaveExactPromptButtons(['Use 2 Credits']); // No cancel button bc Exploit changed board state
                context.player1.clickPrompt('Use 2 Credits');

                // Verify final state
                expect(context.battleDroidLegion).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.imperialDarkTrooper).toBeInZone('discard');
            });

            it('if Exploit can reduce to 0 but does not, credits are still prompted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 2,
                        resources: 3,
                        hand: ['asajj-ventress#count-dookus-assassin'],
                        groundArena: ['battle-droid', 'separatist-commando'],
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that Asajj Ventress is playable
                expect(context.player1).toBeAbleToSelect(context.asajjVentress);
                context.player1.clickCard(context.asajjVentress);

                // Exploit is triggered first
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);
                context.player1.clickPrompt('Trigger Exploit');

                // Can select a single unit to reduce cost to 2
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.separatistCommando]);
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Prompt for credits should appear
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Asajj Ventress');
                expect(context.player1).toHaveExactPromptButtons(['Select amount', 'Pay costs without Credit tokens']);
                context.player1.clickPrompt('Select amount');

                // Should be able to choose 1 or 2 credits
                expect(context.player1).toHaveExactDropdownListOptions(['1', '2']);
                context.player1.chooseListOption('2');

                // Verify final state
                expect(context.asajjVentress).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0); // 2 credits used
                expect(context.player1.readyResourceCount).toBe(3); // No resources used
                expect(context.battleDroid).toBeInZone('outsideTheGame');
            });

            it('if Exploit can reduce to 0 and does, credits are not prompted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 2,
                        resources: 3,
                        hand: ['asajj-ventress#count-dookus-assassin'],
                        groundArena: ['battle-droid', 'separatist-commando'],
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that Asajj Ventress is playable
                expect(context.player1).toBeAbleToSelect(context.asajjVentress);
                context.player1.clickCard(context.asajjVentress);

                // Exploit is triggered first
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);
                context.player1.clickPrompt('Trigger Exploit');

                // Can select both units to reduce cost to 0
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.separatistCommando]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.separatistCommando);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // No prompt for credits should appear
                expect(context.asajjVentress).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(2); // No credits used
                expect(context.player1.readyResourceCount).toBe(3); // No resources used
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.separatistCommando).toBeInZone('discard');
            });
        });

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
                expect(context.player1).toBeAbleToSelect(context.asajjVentress);
                context.player1.clickCard(context.asajjVentress);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.theStarhawk]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.theStarhawk);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.asajjVentress).toBeInZone('groundArena');
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

                context.player1.setExactReadyResources(4);
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
            it('Vuutun Palaa cost adjustment should not trigger at pay time if it is exploited away', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'separatist-commando', 'clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.vuutunPalaa, context.cloneTrooper, context.battleDroid, context.separatistCommando]);
                context.player1.clickCard(context.vuutunPalaa);
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                // VP was exploited away, skip over the exhaust trigger step

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.hailfireTank).toBeInZone('groundArena');
            });

            it('opportunity cost for exploiting Vuutun Palaa should be calculated correctly (unit can be played by exploiting Vuutun Palaa)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['asajj-ventress#count-dookus-assassin'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid']
                    }
                });

                const { context } = contextRef;

                context.player1.setExactReadyResources(0);
                expect(context.player1).toBeAbleToSelect(context.asajjVentressCountDookusAssassin);
                context.player1.clickCard(context.asajjVentressCountDookusAssassin);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.vuutunPalaa]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.vuutunPalaa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.asajjVentressCountDookusAssassin).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.vuutunPalaa).toBeInZone('discard');
            });

            it('opportunity cost for exploiting Vuutun Palaa should be calculated correctly (unit cannot be played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.hailfireTank);
            });

            it('opportunity cost for exploiting exhausted Droids should be calculated correctly (unit can be played by exploiting exhausted Droid)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: [{ card: 'separatist-commando', exhausted: true }, 'battle-droid', 'clone-trooper'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);
                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.separatistCommando, context.cloneTrooper]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.separatistCommando);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                // exhaust units selection
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).not.toHaveEnabledPromptButton('Cancel');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.separatistCommando).toBeInZone('discard');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.battleDroid.exhausted).toBeTrue();
            });

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

                // exhaust units selection
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).not.toHaveEnabledPromptButton('Cancel');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.separatistCommando).toBeInZone('discard');
                expect(context.battleDroid.exhausted).toBeTrue();
            });

            it('playing the card should fully cancel if the Exploit step is cancelled', async function () {
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
                context.player1.clickPrompt('Cancel');

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('hand');
            });

            it('non-optimal play cost should be allowed and minimum required targets updated at trigger time based on selections', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['separatist-super-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'clone-trooper', 'snowspeeder'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelect(context.separatistSuperTank);
                context.player1.clickCard(context.separatistSuperTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.cloneTrooper, context.vuutunPalaa, context.snowspeeder]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // optimal path: select the two non-droid, non-VP units and confirm that we could click done
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path 1: unselect both, select VP and any two units, we should be able to be done
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.cloneTrooper);

                context.player1.clickCard(context.vuutunPalaa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path 2: unselect all, select the Droid, must select two other units as well
                context.player1.clickCard(context.vuutunPalaa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.cloneTrooper);

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.separatistSuperTank).toBeInZone('groundArena');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.vuutunPalaa).toBeInZone('spaceArena');
                expect(context.snowspeeder).toBeInZone('discard');
            });

            it('other cost adjustments should be correctly accounted for', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'count-dooku#face-of-the-confederacy',
                        base: 'administrators-tower',
                        hand: ['invincible#naval-adversary'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'clone-trooper'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // use Dooku effect to play Invincible with Exploit 1
                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.invincible);

                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.invincible).toBeInZone('spaceArena');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.battleDroid.exhausted).toBeTrue();
            });
        });

        describe('Vuutun Palaa + Credits:', function () {
            it('triggers Vuutun Palaa first, and applies correct discount for credits', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 2,
                        resources: 3,
                        hand: ['the-father#maintaining-balance'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['oomseries-officer', 'b1-security-team', 'imperial-dark-trooper'],
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that The Father is playable
                // 8 cost unit (3 droids, 3 resources, 2 credits)
                expect(context.player1).toBeAbleToSelect(context.theFather);
                context.player1.clickCard(context.theFather);

                // Vuutun Palaa is triggered first
                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                // Must select three droid units to cover full cost
                expect(context.player1).toBeAbleToSelectExactly([context.oomseriesOfficer, context.b1SecurityTeam, context.imperialDarkTrooper]);
                context.player1.clickCard(context.oomseriesOfficer);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.b1SecurityTeam);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.imperialDarkTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Must use 2 credits to be able to cover full cost
                expect(context.player1).toHaveExactPromptButtons(['Use 2 Credits']); // No cancel button bc VP changed board state
                context.player1.clickPrompt('Use 2 Credits');

                // Verify final state
                expect(context.theFather).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.oomseriesOfficer.exhausted).toBeTrue();
                expect(context.b1SecurityTeam.exhausted).toBeTrue();
                expect(context.imperialDarkTrooper.exhausted).toBeTrue();
            });
        });

        describe('Vuutun Palaa + Starhawk:', function () {
            it('reductions should be combined correctly at pay time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-son#embodiment-of-darkness'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'separatist-commando', 'clone-trooper'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theSon);

                context.player1.clickPrompt('Pay cost by exhausting units');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.separatistCommando]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.theSon).toBeInZone('groundArena');
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.separatistCommando.exhausted).toBeTrue();
            });

            it('reductions should be combined correctly at resolve time, accounting for exhausted Droid units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-son#embodiment-of-darkness'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: [{ card: 'battle-droid', exhausted: true }, 'separatist-commando', 'clone-trooper'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.theSon);
            });

            it('other cost adjustments should be correctly accounted for', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['republic-attack-pod'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                context.player1.setExactReadyResources(2);
                context.player1.clickCard(context.republicAttackPod);

                context.player1.clickPrompt('Pay cost by exhausting units');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.republicAttackPod).toBeInZone('groundArena');
                expect(context.battleDroid.exhausted).toBeTrue();
            });
        });

        describe('Starhawk + Credits:', function () {
            it('evaluates Starhawk\'s halving effect first, and applies correct discount for credits', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 2,
                        resources: 2,
                        hand: ['the-father#maintaining-balance'],
                        spaceArena: ['the-starhawk#prototype-battleship']
                    }
                });

                const { context } = contextRef;

                // System should correctly determine that The Father is playable
                // 8 cost unit (halved to 4 by Starhawk, playable with 2 resources and 2 credits)
                expect(context.player1).toBeAbleToSelect(context.theFather);
                context.player1.clickCard(context.theFather);

                // Pay part of cost with credits
                expect(context.player1).toHaveExactPromptButtons(['Use 2 Credits', 'Cancel']);
                context.player1.clickPrompt('Use 2 Credits');

                // Verify final state
                expect(context.theFather).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.readyResourceCount).toBe(0);
            });
        });

        describe('Vuutun Palaa + Starhawk + Credits:', function () {
            it('when all adjusters are active, only the credit token should be triggered for game effect payments', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base', // For cunning aspect
                        credits: 2,
                        resources: 5,
                        hand: ['freelance-assassin'],
                        spaceArena: [
                            'vuutun-palaa#droid-control-ship',
                            'the-starhawk#prototype-battleship'
                        ],
                        groundArena: [
                            'imperial-dark-trooper',
                            'oomseries-officer'
                        ],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Freelance Assassin
                context.player1.clickCard(context.freelanceAssassin);

                // Should trigger adjusters, but we'll pay costs normally for playing the unit
                expect(context.player1).toHavePrompt('Choose pay mode for Freelance Assassin'); // Vuutun Palaa prompt
                context.player1.clickPrompt('Pay cost normally');
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Freelance Assassin');
                context.player1.clickPrompt('Pay costs without Credit tokens');
                expect(context.player1.exhaustedResourceCount).toBe(2); // 1 resource discount from Starhawk

                // When Played ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to deal 2 damage to a unit');
                context.player1.clickPrompt('Trigger');

                // Credit token payment should be the only cost adjustment option
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Freelance Assassin\'s effect');
                context.player1.clickPrompt('Pay costs without Credit tokens');

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit');
                context.player1.clickCard(context.consularSecurityForce);

                // Verify damage was done and Starhawk did not discount resource payment
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(4); // 2 resources to play, 2 resources for effect
            });
        });

        describe('Exploit + Vuutun Palaa + Starhawk:', function () {
            it('Vuutun Palaa and Starhawk cost adjustments should not trigger at pay time if they are exploited away', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.vuutunPalaa, context.cloneTrooper, context.battleDroid, context.theStarhawk]);
                context.player1.clickCard(context.vuutunPalaa);
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickPrompt('Done');

                // VP was exploited away, skip over the exhaust trigger step

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.theStarhawk).toBeInZone('discard');
                expect(context.vuutunPalaa).toBeInZone('discard');
                expect(context.hailfireTank).toBeInZone('groundArena');
            });

            it('opportunity cost for exploiting Vuutun Palaa and Starhawk should be calculated correctly (unit can be played by exploiting both)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#general-of-the-droid-armies',
                        hand: ['san-hill#chairman-of-the-banking-clan'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid']
                    }
                });

                const { context } = contextRef;

                context.player1.setExactReadyResources(0);
                expect(context.player1).toBeAbleToSelect(context.sanHill);
                context.player1.clickCard(context.sanHill);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.vuutunPalaa, context.theStarhawk]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.vuutunPalaa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.theStarhawk);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.sanHill).toBeInZone('groundArena');
                expect(context.theStarhawk).toBeInZone('discard');
                expect(context.vuutunPalaa).toBeInZone('discard');
            });

            it('opportunity cost for exploiting exhausted Droids should be calculated correctly (unit can be played by exploiting exhausted Droid)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: [{ card: 'separatist-commando', exhausted: true }, 'battle-droid', 'clone-trooper'],
                        resources: 1
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);
                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.separatistCommando, context.cloneTrooper]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.separatistCommando);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                // exhaust units selection
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.separatistCommando).toBeInZone('discard');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.battleDroid.exhausted).toBeTrue();
            });

            it('optimal play cost should be computed correctly and triggered', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'generals-guardian', 'separatist-commando', 'clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.setExactReadyResources(0);
                expect(context.player1).toBeAbleToSelect(context.hailfireTank);
                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.separatistCommando, context.generalsGuardian, context.battleDroid]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.battleDroid]);
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // unselect battle droid to confirm that target filtering updates correctly
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper, context.separatistCommando, context.generalsGuardian, context.battleDroid]);
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickPrompt('Done');

                // exhaust units selection
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.generalsGuardian);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.hailfireTank).toBeInZone('groundArena');
                expect(context.separatistCommando).toBeInZone('discard');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.battleDroid.exhausted).toBeTrue();
            });

            it('non-optimal play cost should be allowed and minimum required targets updated at trigger time based on selections', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['separatist-super-tank'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper', 'snowspeeder'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelect(context.separatistSuperTank);
                context.player1.clickCard(context.separatistSuperTank);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.cloneTrooper, context.vuutunPalaa, context.theStarhawk, context.snowspeeder]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // optimal path: select the two non-droid, non-VP units and confirm that we could click done
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path 1: unselect both, select VP and any two non-Starhawk units, we should be able to be done
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.cloneTrooper);

                context.player1.clickCard(context.vuutunPalaa);
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.cloneTrooper, context.vuutunPalaa, context.snowspeeder]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path 2: unselect all, select the Droid, must select two other non-Starhawk units as well
                context.player1.clickCard(context.vuutunPalaa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.cloneTrooper);

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.cloneTrooper, context.vuutunPalaa, context.snowspeeder]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // non-optimal path 3: unselect all, select Starhawk, must select the two non-Droid units
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.cloneTrooper);

                context.player1.clickCard(context.theStarhawk);
                expect(context.player1).toBeAbleToSelectExactly([context.theStarhawk, context.cloneTrooper, context.snowspeeder]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                // exhaust droid
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.separatistSuperTank).toBeInZone('groundArena');
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.vuutunPalaa).toBeInZone('spaceArena');
                expect(context.snowspeeder).toBeInZone('discard');
                expect(context.theStarhawk).toBeInZone('discard');
            });

            it('other cost adjustments should be correctly accounted for', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'count-dooku#face-of-the-confederacy',
                        base: 'administrators-tower',
                        hand: ['invincible#naval-adversary'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper'],
                        resources: 1
                    }
                });

                const { context } = contextRef;

                // use Dooku effect to play Invincible with Exploit 1
                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.invincible);

                expect(context.player1).toBeAbleToSelectExactly([context.cloneTrooper]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.invincible).toBeInZone('spaceArena');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.battleDroid.exhausted).toBeTrue();
            });
        });

        describe('Exploit + Vuutun Palaa + Starhawk + Credits:', function () {
            it('all cost adjustments should be correctly accounted for at each stage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        credits: 2,
                        resources: 2,
                        hand: ['the-invasion-of-christophsis'],
                        spaceArena: ['vuutun-palaa#droid-control-ship', 'the-starhawk#prototype-battleship'],
                        groundArena: [
                            'imperial-dark-trooper',
                            'death-star-stormtrooper',
                            'separatist-commando',
                            'oomseries-officer'
                        ],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // The Invasion of Christophsis should be playable with all cost adjustments
                // 15 cost event with Exploit 4
                expect(context.player1).toBeAbleToSelect(context.theInvasionOfChristophsis);
                context.player1.clickCard(context.theInvasionOfChristophsis);

                // Exploit is triggered first
                expect(context.player1).toHaveExactPromptButtons(['Trigger Exploit', 'Cancel']);
                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Starhawk not selectable due to opportunity cost
                    context.vuutunPalaa,
                    context.imperialDarkTrooper,
                    context.separatistCommando,
                    context.deathStarStormtrooper,
                    context.oomseriesOfficer
                ]);

                // Must select at least 2 targets, but we'll select 3 here
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.imperialDarkTrooper);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickPrompt('Done');

                // Vuutun Palaa trigger step
                expect(context.player1).toHavePrompt('Select a unit to exhaust as if they were resources');
                expect(context.player1).toBeAbleToSelectExactly([context.oomseriesOfficer]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.oomseriesOfficer);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Use credits
                expect(context.player1).toHaveExactPromptButtons(['Use 2 Credits']); // No cancel button bc Exploit/VP changed board state
                context.player1.clickPrompt('Use 2 Credits');

                // Verify final state
                expect(context.theInvasionOfChristophsis).toBeInZone('discard');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.imperialDarkTrooper).toBeInZone('discard');      // Exploited
                expect(context.deathStarStormtrooper).toBeInZone('discard');    // Exploited
                expect(context.separatistCommando).toBeInZone('discard');       // Exploited
                expect(context.oomseriesOfficer).toBeInZone('groundArena');
                expect(context.oomseriesOfficer.exhausted).toBeTrue();
            });
        });
    });
});
