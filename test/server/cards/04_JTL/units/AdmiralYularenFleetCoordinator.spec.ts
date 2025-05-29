describe('Admiral Yularen, Fleet Coordinator', function() {
    integration(function(contextRef) {
        describe('Admiral Yularen\'s When Played ability', function() {
            it('should be prompted to choose either Grit, Restore 1, Sentinel, or Shielded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                expect(context.player1).toHaveExactPromptButtons(['Grit', 'Restore 1', 'Sentinel', 'Shielded']);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickPrompt('Grit');
                expect(context.getChatLogs(1)[0]).toContain('to give Grit to each friendly Vehicle unit while in play');

                expect(context.player2).toBeActivePlayer();
            });

            it('should give Grit to friendly Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Grit');
                expect(context.concordDawnInterceptors.getPower()).toBe(3);
            });

            it('should give Sentinel to friendly Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Sentinel');
                expect(context.getChatLogs(1)[0]).toContain('to give Sentinel to each friendly Vehicle unit while in play');
                context.player2.clickCard(context.concordDawnInterceptors);
                expect(context.player2).toBeAbleToSelectExactly([context.tielnFighter]);
                context.player2.clickCard(context.tielnFighter);
            });

            it('should give Restore 1 to friendly Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'dagobah-swamp', damage: 3 },
                        hand: ['admiral-yularen#fleet-coordinator'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Restore 1');
                expect(context.getChatLogs(1)[0]).toContain('to give Restore 1 to each friendly Vehicle unit while in play');
                context.player2.passAction();

                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should give Shielded to friendly Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator', 'alliance-xwing'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Shielded');
                expect(context.getChatLogs(1)[0]).toContain('to give Shielded to each friendly Vehicle unit while in play');
                expect(context.concordDawnInterceptors).not.toHaveExactUpgradeNames(['shield']);
                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['shield']);
            });

            it('should give Shielded to friendly token Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator', 'dedicated-wingmen'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Shielded');
                expect(context.concordDawnInterceptors).not.toHaveExactUpgradeNames(['shield']);
                context.player2.passAction();

                context.player1.clickCard(context.dedicatedWingmen);
                context.player1.clickPrompt('Shielded'); // There are two simultaneous Shielded triggers here

                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(2);
                expect(xwings[0]).toHaveExactUpgradeNames(['shield']);
            });

            it('should not give keywords to enemy Vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-yularen#fleet-coordinator'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        hand: ['dedicated-wingmen']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Shielded');

                context.player2.clickCard(context.dedicatedWingmen);

                const xwings = context.player2.findCardsByName('xwing');
                expect(xwings[0]).not.toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
