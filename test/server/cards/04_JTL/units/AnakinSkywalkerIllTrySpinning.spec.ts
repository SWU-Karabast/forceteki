
describe('Anakin Skywalker, I\'ll try spinning', function () {
    integration(function (contextRef) {
        describe('Anakin Skywalker\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#ill-try-spinning'],
                        groundArena: ['escort-skiff'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['maul#shadow-collective-visionary'],
                    }
                });
            });

            it('may return to your hand after completing an attack while piloting', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play Anakin Skywalker with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.escortSkiff]);
                context.player1.clickCard(context.escortSkiff);
                expect(context.escortSkiff).toHaveExactUpgradeNames([context.anakinSkywalker.internalName]);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.escortSkiff);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Return Anakin Skywalker to your hand');
                expect(context.anakinSkywalker).toBeInZone('hand');
                expect(context.escortSkiff).toBeInZone('groundArena');
                context.player2.passAction();

                // We can do it a second time during the same phase
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play Anakin Skywalker with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.escortSkiff]);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([context.anakinSkywalker.internalName]);
                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Return Anakin Skywalker to your hand');
                expect(context.anakinSkywalker).toBeInZone('hand');
                expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            });

            it('may remain attached after completing an attack while piloting', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play Anakin Skywalker with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.escortSkiff]);
                context.player1.clickCard(context.escortSkiff);
                expect(context.escortSkiff).toHaveExactUpgradeNames([context.anakinSkywalker.internalName]);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.escortSkiff);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Keep Anakin Skywalker attached');
                expect(context.anakinSkywalker).toBeInZone('groundArena');
            });

            it('should not trigger if he does not survive to the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play Anakin Skywalker with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.escortSkiff]);
                context.player1.clickCard(context.escortSkiff);
                expect(context.escortSkiff).toHaveExactUpgradeNames([context.anakinSkywalker.internalName]);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.escortSkiff);
                context.player1.clickCard(context.maul);
                expect(context.anakinSkywalker).toBeInZone('discard');
                expect(context.escortSkiff).toBeInZone('discard');
                expect(context.maul).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if he is deployed as ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play Anakin Skywalker');
                context.moveToNextActionPhase();

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);
                expect(context.anakinSkywalker).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
