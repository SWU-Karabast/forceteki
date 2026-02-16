describe('Hound\'s Tooth, Hunter\'s Approach', function () {
    integration(function (contextRef) {
        describe('Hound\'s Tooth\'s when attacks ends ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing', 'hounds-tooth#hunters-approach']
                    },
                    player2: {
                        groundArena: ['atst', 'yoda#old-master'],
                        spaceArena: ['awing', 'avenger#hunting-star-destroyer', { card: 'chimaera#flagship-of-the-seventh-fleet', damage: 6 }],
                    }
                });
            });

            it('should defeat a unit with less power than him (target base)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.awing, context.yoda]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard', context.player2);
            });

            it('should defeat a unit with less power than him (target unit)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.awing);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.yoda]);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing).toBeInZone('discard', context.player1);
            });

            it('should not defeat a unit if he is killed while attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.avenger);

                expect(context.player2).toBeActivePlayer();
                expect(context.houndsTooth).toBeInZone('discard', context.player1);
            });

            it('should not defeat a unit if he is killed while attacking (even if he killed someone)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.chimaera);

                expect(context.player2).toBeActivePlayer();
                expect(context.houndsTooth).toBeInZone('discard', context.player1);
                expect(context.chimaera).toBeInZone('discard', context.player2);
            });
        });

        describe('Hound\'s Tooth\'s ability (simultaneous triggers)', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        spaceArena: ['hounds-tooth#hunters-approach']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'raddus#holdos-final-command', upgrades: ['perilous-position'] }],
                    }
                });
            });

            it('should defeat a unit if he survives (trigger first)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.raddus);

                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('You');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.houndsTooth);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            });

            it('should not defeat a unit if he is killed by another When Defeated ability (trigger second)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.houndsTooth);
                context.player1.clickCard(context.raddus);

                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('Opponent');

                context.player2.clickCard(context.houndsTooth);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            });
        });

        it('Hound\'s Tooth\'s ability should not trigger if he is defeated while attacking and replayed instantly', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    spaceArena: ['hounds-tooth#hunters-approach']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['unrefusable-offer'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'raddus#holdos-final-command', upgrades: ['perilous-position'] }],
                }
            });
            const { context } = contextRef;
            context.player2.clickCard(context.unrefusableOffer);
            context.player2.clickCard(context.houndsTooth);

            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.raddus);

            context.player1.clickPrompt('Opponent');
            context.player2.clickCard(context.houndsTooth);
            context.player2.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.houndsTooth).toBeInZone('spaceArena', context.player2);
        });

        it('Hound\'s Tooth\'s should defeat a unit with less power than him (power modified by upgrades)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    spaceArena: [{ card: 'hounds-tooth#hunters-approach', upgrades: ['twice-the-pride', 'twice-the-pride'] }]
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer', 'awing'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.avenger]);
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });

        it('Hound\'s Tooth\'s should defeat a unit with less power than him (power modified by ability only for this attack)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    spaceArena: [{ card: 'hounds-tooth#hunters-approach' }],
                    leader: 'anakin-skywalker#what-it-takes-to-win',
                    resources: 1
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['the-ghost#spectre-home-base', 'awing'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.anakinSkywalker);
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.awing);

            expect(context.houndsTooth.getPower()).toBe(4);
            // the ghost (5 power) not selectable
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });
    });
});