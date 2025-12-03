describe('Vuutun Palaa, Droid Control Ship', function() {
    integration(function(contextRef) {
        describe('Vuutun Palaa\'s play cost reduction ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'count-dooku#face-of-the-confederacy',
                        hand: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'generals-guardian', 'wampa']
                    },
                    player2: {
                        groundArena: ['separatist-commando']
                    }
                });
            });

            it('should decrease its play cost by 1 for each friendly Droid unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vuutunPalaa);

                expect(context.vuutunPalaa).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('should stack with Exploit even if the droid units are exploited', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play a Separatist card from your hand. It gains Exploit 1.');
                context.player1.clickCard(context.vuutunPalaa);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian, context.wampa]);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.vuutunPalaa).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.wampa.exhausted).toBeFalse();
            });
        });

        describe('Vuutun Palaa\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['atst', 'vanguard-infantry', 'encouraging-leadership', 'generals-blade'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'generals-guardian', 'wampa']
                    },
                    player2: {
                        groundArena: ['separatist-commando']
                    }
                });
            });

            it('can reduce the cost of a unit by exhausting Droid units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('can be safely cancelled after choosing targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Cancel');

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('hand');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.battleDroid.exhausted).toBeFalse();
                expect(context.generalsGuardian.exhausted).toBeFalse();
            });

            it('can reduce the cost by exhausting Droid units, prompting correctly if a minimum number is required to be able to pay the full cost', function () {
                const { context } = contextRef;

                // unit costs 6, exactly two droids are required to be exhausted to play it with available resources
                context.player1.setExactReadyResources(4);
                context.player1.clickCard(context.atst);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveDisabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('can reduce the cost by exhausting Droid units, and will not consider exhausted Droid units for targeting purposes at pay time', function () {
                const { context } = contextRef;

                // exhaust the Battle Droid by attacking
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.atst);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('can exhaust more Droid units than required for the cost', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanguardInfantry);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.vanguardInfantry).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('can reduce the cost by exhausting Droid units, and will not consider exhausted Droid units for targeting purposes at resolve time (cannot be played)', function () {
                const { context } = contextRef;

                // exhaust the Battle Droid by attacking
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // can't play AT-ST as only one droid is available to exhaust and two are needed to reduce cost to 4
                context.player1.setExactReadyResources(4);
                expect(context.player1).not.toBeAbleToSelect(context.atst);
            });

            it('can reduce the cost of an event by exhausting Droid units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.encouragingLeadership);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.encouragingLeadership).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('can reduce the cost of an upgrade by exhausting Droid units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalsBlade);
                context.player1.clickCard(context.generalsGuardian);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');

                expect(context.generalsGuardian).toHaveExactUpgradeNames(['generals-blade']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('will work for every card played while it is in effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanguardInfantry);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                context.player1.clickPrompt('Done');

                expect(context.vanguardInfantry).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.battleDroid.exhausted).toBeFalse();
                expect(context.generalsGuardian.exhausted).toBeTrue();

                context.player2.passAction();

                context.player1.clickCard(context.atst);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battleDroid.exhausted).toBeTrue();
                expect(context.generalsGuardian.exhausted).toBeTrue();

                // move to next phase to confirm it lasts
                context.moveToNextActionPhase();

                context.player1.clickCard(context.encouragingLeadership);

                expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Pay cost normally', 'Cancel']);
                context.player1.clickPrompt('Pay cost by exhausting units');

                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickCard(context.generalsGuardian);
                context.player1.clickPrompt('Done');

                expect(context.encouragingLeadership).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.battleDroid.exhausted).toBeFalse();
                expect(context.generalsGuardian.exhausted).toBeTrue();
            });
        });

        it('Vuutun Palaa\'s constant ability can reduce the cost of a unit played with Smuggle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    spaceArena: ['vuutun-palaa#droid-control-ship'],
                    groundArena: ['battle-droid', 'generals-guardian', 'wampa'],
                    resources: ['collections-starhopper']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.collectionsStarhopper);

            expect(context.player1).toHaveExactPromptButtons(['Pay cost by exhausting units', 'Cancel']);
            context.player1.clickPrompt('Pay cost by exhausting units');

            expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.generalsGuardian]);
            expect(context.player1).toHaveDisabledPromptButton('Done');
            expect(context.player1).toHaveEnabledPromptButton('Cancel');

            context.player1.clickCard(context.generalsGuardian);
            expect(context.player1).toHaveDisabledPromptButton('Done');

            context.player1.clickCard(context.battleDroid);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            context.player1.clickPrompt('Done');

            expect(context.collectionsStarhopper).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.battleDroid.exhausted).toBeTrue();
            expect(context.generalsGuardian.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeFalse();
        });
    });
});