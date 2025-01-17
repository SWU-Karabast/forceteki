describe('Triple Dark Raid', function () {
    integration(function (contextRef) {
        describe('Triple Dark Raid\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true },
                        hand: ['triple-dark-raid'],
                        deck: ['grievouss-wheel-bike', 'atst', 'battlefield-marine', 'pyke-sentinel', 'wampa', 'alliance-xwing', 'rebel-pathfinder', 'consortium-starviper']
                    },
                    player2: {
                        hand: ['change-of-heart']
                    }
                });
            });

            it('Can put Vehicle unit into play', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveEnabledPromptButtons([context.grievoussWheelBike, context.atst, context.allianceXWing, 'Take nothing']);
                // Click vehicle unit
                context.player1.clickPrompt(context.atst.title);
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
                expect(context.player1).toHaveEnabledPromptButtons([context.grievoussWheelBike, context.atst, context.allianceXWing, 'Take nothing']);
                // Click vehicle unit
                context.player1.clickPrompt(context.atst.title);
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

            it('Can put Vehicle upgrade into play', function () {
                const { context } = contextRef;

                const resourcesBefore = context.player1.readyResourceCount;

                context.player1.clickCard(context.tripleDarkRaid);
                expect(context.player1).toHaveEnabledPromptButtons([context.grievoussWheelBike, context.atst, context.allianceXWing, 'Take nothing']);

                // Click vehicle upgrade
                context.player1.clickPrompt(context.grievoussWheelBike.title);
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
    });
});
