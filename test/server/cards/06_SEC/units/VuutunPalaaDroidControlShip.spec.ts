describe('Vuutun Palaa, Droid Control Ship', function() {
    integration(function(contextRef) {
        // TODO THIS PR: test its own cost decrease ability

        describe('Vuutun Palaa\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dryden-vos#i-never-ask-twice',
                        hand: ['atst', 'vanguard-infantry'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        groundArena: ['battle-droid', 'generals-guardian', 'wampa']
                    }
                });
            });

            it('can reduce the cost by exhausting Droid units', function () {
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
        });
    });
});