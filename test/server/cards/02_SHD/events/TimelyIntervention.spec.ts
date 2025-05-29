describe('Timely Intervention', function () {
    integration(function (contextRef) {
        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['timely-intervention', 'rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });

        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['timely-intervention', 'tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush (from smuggle)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
                expect(context.getChatLogs(4)).toContain('player1 plays Timely Intervention using Smuggle to play Rebel Pathfinder and to give Ambush to Rebel Pathfinder for this phase');
            });
        });

        it('Timely Intervention\'s ability should not allow selecting targets that can\'t be afforded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'timely-intervention'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            expect(context.player2).toBeActivePlayer();
        });

        it('Timely Intervention\'s ability should not give poe dameron ambush after attempting to use ECL', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'timely-intervention'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.poeDameron).not.toHaveAvailableActionWhenClickedBy(context.player1);

            context.ignoreUnresolvedActionPhasePrompts = true;
        });

        it('should do nothing when choosing nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['poe-dameron#quick-to-improvise', 'wampa', 'timely-intervention'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'command-center',
                    resources: 5
                },
                player2: {
                    groundArena: ['rugged-survivors']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            context.player1.clickPrompt('Choose nothing');

            expect(context.poeDameron).toBeInZone('hand');
            expect(context.poeDameron.hasSomeKeyword('ambush')).toBeFalse();
            expect(context.wampa).toBeInZone('hand');
            expect(context.wampa.hasSomeKeyword('ambush')).toBeFalse();
        });
    });
});
