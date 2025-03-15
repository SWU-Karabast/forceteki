
describe('Triple Dark Raid', function () {
    integration(function (contextRef) {
        describe('Triple Dark Raid\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true },
                        hand: ['triple-dark-raid'],
                        deck: ['grievouss-wheel-bike', 'atst', 'battlefield-marine', 'pyke-sentinel', 'wampa', 'alliance-xwing', 'rebel-pathfinder', 'consortium-starviper']
                    },
                    player2: {
                        hand: ['change-of-heart', 'rivals-fall', 'waylay']
                    }
                });
            });

            it('can choose to take nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
            });

            it('Can put Vehicle unit into play', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Click vehicle unit
                context.player1.clickCardInDisplayCardPrompt(context.atst);
                // Check that it is in play, ready, and resources were paid
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 4); // AT-ST reduced by 5, so TDR cost + 1
                // Move to next round, check in hand
                context.moveToNextActionPhase();
                expect(context.atst).toBeInZone('hand', context.player1);
            });

            it('Vehicle put into play returns to its owner\'s hand if stolen', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Click vehicle unit
                context.player1.clickCardInDisplayCardPrompt(context.atst);
                // Check that it is in play, ready, and resources were paid
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 4); // AT-ST reduced by 5, so TDR cost + 1

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.atst);

                // Move to next round, check in hand
                context.moveToNextActionPhase();
                expect(context.atst).toBeInZone('hand', context.player1);
            });

            it('Vehicle put into play does not return to its owner\'s hand if defeated', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Click vehicle unit
                context.player1.clickCardInDisplayCardPrompt(context.atst);
                // Check that it is in play, ready, and resources were paid
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 4); // AT-ST reduced by 5, so TDR cost + 1

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.atst);

                // Move to next round, check not in hand
                context.moveToNextActionPhase();
                expect(context.atst).toBeInZone('discard');
            });

            it('Vehicle put into play does not return to its owner\'s hand if waylaid and played again', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Click vehicle unit
                context.player1.clickCardInDisplayCardPrompt(context.atst);
                // Check that it is in play, ready, and resources were paid
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 4); // AT-ST reduced by 5, so TDR cost + 1

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.atst);

                // Move to next round, check not in hand
                context.moveToNextActionPhase();
                expect(context.atst).toBeInZone('groundArena');
            });

            it('Can put Vehicle upgrade into play', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grievoussWheelBike, context.atst, context.allianceXwing],
                    invalid: [context.battlefieldMarine, context.pykeSentinel, context.rebelPathfinder, context.wampa]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Click vehicle upgrade
                context.player1.clickCardInDisplayCardPrompt(context.grievoussWheelBike);
                context.player1.clickCard(context.jangoFett);

                // Check that it is in play, ready, and resources were paid
                expect(context.jangoFett.getPower()).toBe(6);
                expect(context.jangoFett.getHp()).toBe(10);
                expect(context.player1.readyResourceCount).toBe(resourcesBefore - 3);

                // Move to next round, check in hand
                context.moveToNextActionPhase();
                expect(context.grievoussWheelBike).toBeInZone('hand', context.player1);
            });
        });

        describe('Triple Dark Raid\'s ability', function () {
            it('Will return chosen vehicle to hand and defeat an attached pilot leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        hand: ['triple-dark-raid'],
                        deck: ['grievouss-wheel-bike', 'atst', 'battlefield-marine', 'pyke-sentinel', 'wampa', 'alliance-xwing', 'rebel-pathfinder', 'consortium-starviper'],
                        resources: 6
                    },
                    player2: {
                        hand: ['change-of-heart', 'rivals-fall', 'waylay']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tripleDarkRaid);
                context.player1.clickCardInDisplayCardPrompt(context.atst);

                context.player2.passAction();

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
                context.player1.clickCard(context.atst);

                context.moveToNextActionPhase();

                expect(context.atst).toBeInZone('hand');
                expect(context.asajjVentress).toBeInZone('base');
                context.player1.clickCard(context.asajjVentress);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
