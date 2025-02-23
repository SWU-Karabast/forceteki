
describe('Count Dooku, Face of the Confederacy', function () {
    integration(function (contextRef) {
        describe('Count Dooku\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            });

            it('should play a Separatist card from hand that does not already have Exploit and give it Exploit 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian, context.dwarfSpiderDroid]);
                context.player1.clickCard(context.generalsGuardian);
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit']);

                context.player1.clickPrompt('Trigger Exploit');
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
            });

            it('should play a Separatist card from hand that has Exploit already and give it an additional Exploit 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian, context.dwarfSpiderDroid]);
                context.player1.clickCard(context.droidekaSecurity);
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit']);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Exploit selection
                context.player1.clickCard(context.battleDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.cartelSpacer);
                // extra click on AT-ST to confirm that the Exploit limit is 3
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.snowspeeder).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.droidekaSecurity).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('should play a Separatist card from hand that does not already have Exploit and give it Exploit 1 as the required play option if there are not enough resources for standard play', function () {
                const { context } = contextRef;

                context.player1.exhaustResources(4);

                context.player1.clickCard(context.countDooku);
                expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian, context.dwarfSpiderDroid]);
                context.player1.clickCard(context.dwarfSpiderDroid);

                // go directly to Exploit targeting since there are too few resources for standard play
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Exploit selection
                context.player1.clickCard(context.snowspeeder);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                // extra click on AT-ST to confirm that the Exploit limit is 1
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.snowspeeder).toBeInZone('discard');
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
                        hand: [
                            'infiltrating-demolisher',
                            'pyke-sentinel',
                            'dwarf-spider-droid',
                            'the-invisible-hand#imposing-flagship',
                            'heroes-on-both-sides'
                        ],
                        groundArena: ['battle-droid', 'atst', 'snowspeeder'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'count-dooku#face-of-the-confederacy', deployed: true },
                        base: 'capital-city'
                    },
                    player2: {
                        hand: ['warrior-drone']
                    }
                });
            });

            it('should give the next Separatist unit played this phase Exploit 3 if it does not already have Exploit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.theInvisibleHand);
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer, context.countDooku]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

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
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // next Separatist card played should not gain Exploit
                context.player2.passAction();
                context.player1.clickCard(context.dwarfSpiderDroid);
                expect(context.player2).toBeActivePlayer();
            });

            it('effect should expire at the end of the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                // next Separatist card played after phase change should not gain Exploit
                context.player1.clickCard(context.dwarfSpiderDroid);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not affect non-Separatist units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.pykeSentinel);
                expect(context.player2).toBeActivePlayer();
            });

            it('does affect Separatist events', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.heroesOnBothSides);
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer, context.countDooku]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

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

                // bypass target selection for event
                context.allowTestToEndWithOpenPrompt = true;
            });

            it('does not affect Separatist units played by the opponent', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.warriorDrone);
                expect(context.player1).toBeActivePlayer();
            });

            it('should give the next Separatist card played this phase an additional Exploit 3 if it does already have Exploit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.infiltratingDemolisher);
                expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);

                context.player1.clickPrompt('Trigger Exploit');
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer, context.countDooku]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // confirm that we can exploit 4 units total
                context.player1.clickCard(context.battleDroid);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCardNonChecking(context.countDooku);
                context.player1.clickPrompt('Done');

                // confirm Exploit results
                expect(context.snowspeeder).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.atst).toBeInZone('discard');
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.countDooku).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // next Separatist card played should not gain Exploit
                context.player2.passAction();
                context.player1.clickCard(context.dwarfSpiderDroid);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Count Dooku\'s leader deployed ability, when used on a unit that already has exploit, should not double-count units for exploit targeting', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['providence-destroyer'],
                    leader: { card: 'count-dooku#face-of-the-confederacy', deployed: true },
                    base: 'capital-city',
                    resources: 4
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.countDooku);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            expect(context.player1).not.toBeAbleToSelect(context.providenceDestroyer);
            expect(context.providenceDestroyer).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
