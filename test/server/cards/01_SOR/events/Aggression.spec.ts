describe('Aggression', function () {
    integration(function (contextRef) {
        const drawPrompt = 'Draw a card';
        const defeatPrompt = 'Defeat up to 2 upgrades';
        const readyPrompt = 'Ready a unit with 3 or less power';
        const damagePrompt = 'Deal 4 damage to a unit';

        describe('Aggression\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['aggression'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: [{ card: 'restored-arc170', exhausted: true, upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['entrenched'] }],
                    }
                });
            });

            it('discards draw and deal 4 damage to a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.aggression);

                expect(context.player1).toHaveEnabledPromptButtons([drawPrompt, defeatPrompt, readyPrompt, damagePrompt]);

                // draw
                context.player1.clickPrompt(drawPrompt);
                expect(context.player1.hand.length).toBe(1);

                expect(context.player1).toHaveEnabledPromptButtons([defeatPrompt, readyPrompt, damagePrompt]);

                context.player1.clickPrompt(damagePrompt);

                // should damage a unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.restoredArc170, context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('ready a unit with 3 or less power and defeat up to 2 upgrades', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.aggression);

                expect(context.player1).toHaveEnabledPromptButtons([drawPrompt, defeatPrompt, readyPrompt, damagePrompt]);

                // ready a unit with 3 or less power
                context.player1.clickPrompt(readyPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.battlefieldMarine]);
                expect(context.restoredArc170.exhausted).toBeFalse();

                expect(context.player1).toHaveEnabledPromptButtons([defeatPrompt, drawPrompt, damagePrompt]);

                // defeat up to 2 upgrades
                context.player1.clickPrompt(defeatPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.experience, context.entrenched]);

                context.player1.clickCard(context.shield);
                context.player1.clickCard(context.experience);
                context.player1.clickCardNonChecking(context.entrenched);
                context.player1.clickPrompt('Done');

                expect(context.restoredArc170.isUpgraded()).toBeFalse();
                expect(context.atst.isUpgraded()).toBeFalse();
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['entrenched']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
