describe('Trace Martez, Trusting Sister', function () {
    integration(function (contextRef) {
        describe('Trace Martez\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trace-martez#trusting-sister'],
                        groundArena: [{ card: 'liberated-slaves', damage: 2 }],
                        spaceArena: ['corellian-freighter']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'fleet-lieutenant'],
                        spaceArena: ['green-squadron-awing', 'bright-hope#the-last-transport']
                    }
                });
            });

            it('should heal up to 2 damage from any number of units on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traceMartezTrustingSister);
                context.player1.clickPrompt('Play Trace Martez with Piloting');
                context.player1.clickCard(context.corellianFreighter);

                // Corellian Freighter should have 2 damage
                context.player2.clickCard(context.brightHope);
                context.player2.clickCard(context.corellianFreighter);

                // Corellian Freighter should have 4 damage
                context.player1.clickCard(context.corellianFreighter);
                context.player1.clickCard(context.brightHope);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.liberatedSlaves,
                    context.corellianFreighter,
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.greenSquadronAwing,
                    context.brightHope
                ]);

                context.player1.setDistributeHealingPromptState(new Map([
                    [context.liberatedSlaves, 1],
                    [context.corellianFreighter, 1],
                    [context.battlefieldMarine, 0],
                    [context.fleetLieutenant, 0],
                    [context.greenSquadronAwing, 0],
                    [context.brightHope, 0]
                ]));

                expect(context.liberatedSlaves.damage).toBe(1);
                expect(context.corellianFreighter.damage).toBe(3);
            });

            it('should be able to assign 0 healing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traceMartezTrustingSister);
                context.player1.clickPrompt('Play Trace Martez with Piloting');
                context.player1.clickCard(context.corellianFreighter);

                // Corellian Freighter should have 2 damage
                context.player2.clickCard(context.brightHope);
                context.player2.clickCard(context.corellianFreighter);

                // Corellian Freighter should have 4 damage
                context.player1.clickCard(context.corellianFreighter);
                context.player1.clickCard(context.brightHope);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.liberatedSlaves,
                    context.corellianFreighter,
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.greenSquadronAwing,
                    context.brightHope
                ]);

                context.player1.setDistributeHealingPromptState(new Map([]));

                expect(context.liberatedSlaves.damage).toBe(2);
                expect(context.corellianFreighter.damage).toBe(4);
            });
        });
    });
});