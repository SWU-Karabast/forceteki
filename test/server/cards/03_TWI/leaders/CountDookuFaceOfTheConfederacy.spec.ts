
describe('Count Dooku, Face of the Confederacy', function () {
    integration(function (contextRef) {
        describe('Count Dooku\'s leader undeployed ability', function () {
            it('should play a Separatist card from hand that does not already have Exploit and give it Exploit 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['droideka-security', 'generals-guardian', 'pyke-sentinel', 'dwarf-spider-droid'],
                        groundArena: ['battle-droid', 'atst', 'snowspeeder'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'count-dooku#face-of-the-confederacy',
                        base: 'capital-city',
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // CASE 1: play a Separatist card from hand that does not already have Exploit and give it Exploit 1
                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian, context.dwarfSpiderDroid]);
                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveExactPromptButtons(['Play General\'s Guardian', 'Play General\'s Guardian using Exploit']);

                context.player1.clickPrompt('Play General\'s Guardian using Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Exploit selection
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                // extra click on AT-ST to confirm that the Exploit limit is 1
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.generalsGuardian).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.moveToNextActionPhase();

                // CASE 2: play a Separatist card from hand that has Exploit already and give it an additional Exploit 1
                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.dwarfSpiderDroid]);
                context.player1.clickCard(context.droidekaSecurity);
                expect(context.player1).toHaveExactPromptButtons(['Play Droideka Security', 'Play Droideka Security using Exploit']);

                context.player1.clickPrompt('Play Droideka Security using Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.snowspeeder, context.cartelSpacer, context.generalsGuardian]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Exploit selection
                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.cartelSpacer);
                // extra click on AT-ST to confirm that the Exploit limit is 3
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.snowspeeder).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.droidekaSecurity).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.moveToNextActionPhase();

                // CASE 3: should play a Separatist card from hand that does not already have Exploit and give it Exploit 1 as the required play option if there are not enough resources for standard play
                context.player1.exhaustResources(4);

                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.dwarfSpiderDroid]);
                context.player1.clickCard(context.dwarfSpiderDroid);

                // go directly to Exploit selection since there are too few resources for standard play
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.droidekaSecurity]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Exploit selection
                context.player1.clickCard(context.droidekaSecurity);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                // extra click on AT-ST to confirm that the Exploit limit is 1
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.droidekaSecurity).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.dwarfSpiderDroid).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        it('Count Dooku\'s leader undeployed ability should default to standard play if there are no units available to exploit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['droideka-security', 'generals-guardian', 'pyke-sentinel'],
                    leader: 'count-dooku#face-of-the-confederacy',
                    base: 'capital-city',
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.countDooku);
            expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian]);
            context.player1.clickCard(context.generalsGuardian);

            expect(context.generalsGuardian).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });

        describe('Count Dooku\'s leader deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['droideka-security', 'generals-guardian', 'pyke-sentinel', 'dwarf-spider-droid'],
                        groundArena: ['battle-droid', 'atst', 'snowspeeder'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'count-dooku#face-of-the-confederacy', deployed: true },
                        base: 'capital-city',
                        resources: 6
                    }
                });
            });

            it('should give +2/+2 to a unit for the phase because a friendly unit was defeat this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.dwarfSpiderDroid);
                expect(context.player1).toHaveExactPromptButtons(['Play Dwarf Spider Droid', 'Play Dwarf Spider Droid using Exploit']);

                context.player1.clickPrompt('Play Dwarf Spider Droid using Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCardNonChecking(context.cartelSpacer);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.snowspeeder).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('spaceArena');
                expect(context.atst).toBeInZone('discard');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });
    });
});
