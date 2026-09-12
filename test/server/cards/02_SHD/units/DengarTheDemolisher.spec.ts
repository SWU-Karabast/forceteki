describe('Dengar, The Demolisher', function () {
    integration(function (contextRef) {
        describe('Dengar\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['electrostaff', 'entrenched'],
                        groundArena: ['dengar#the-demolisher'],
                    },
                    player2: {
                        hand: ['academy-training'],
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should deal 1 damage to the upgraded unit when you play an upgrade', function () {
                const { context } = contextRef;

                // play an upgrade on enemy unit, deal 1 damage  to it
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHaveEnabledPromptButtons(['Deal 1 damage to the upgraded unit', 'Pass']);
                context.player1.clickPrompt('Trigger');
                expect(context.battlefieldMarine.damage).toBe(1);

                // enemy play an upgrade, nothing happen
                context.player2.clickCard(context.academyTraining);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeActivePlayer();

                // play on upgrade on friendly unit, do not deal 1 damage to it
                context.player1.clickCard(context.electrostaff);
                context.player1.clickCard(context.dengar);

                expect(context.player1).toHaveEnabledPromptButtons(['Deal 1 damage to the upgraded unit', 'Pass']);
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
                expect(context.dengar.damage).toBe(0);
            });
        });

        describe('Dengar\'s interaction with base upgrades', function () {
            it('does not trigger when a Fortify upgrade is played on a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-shield-generator'],
                        groundArena: ['dengar#the-demolisher'],
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.allianceShieldGenerator);
                context.player1.clickCard(context.p1Base);

                // Dengar deals damage to "the upgraded unit" - a base upgrade has none, so it doesn't trigger
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.p1Base).toHaveExactUpgradeNames(['alliance-shield-generator']);
            });
        });
    });
});
