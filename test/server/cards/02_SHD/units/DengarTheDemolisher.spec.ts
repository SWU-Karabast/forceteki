describe('Dengar, The Demolisher', function () {
    integration(function (contextRef) {
        describe('Dengar\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
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
                context.player1.clickPrompt('Deal 1 damage to the upgraded unit');
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
    });
});
