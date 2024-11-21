describe('Migs Mayfeld, Triggerman', function() {
    integration(function(contextRef) {
        describe('Migs Mayfeld\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pillage', 'forced-surrender'],
                        groundArena: [{ card: 'grogu#irresistible' }, { card: 'migs-mayfeld#triggerman' }],
                        base: 'command-center'
                    },
                    player2: {
                        hand: ['confiscate', 'daring-raid', 'krayt-dragon'],
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        spaceArena: [{ card: 'system-patrol-craft' }],
                        base: 'chopper-base'
                    }
                });
            });

            it('can deal two damage to a unit or base after a card is discarded from hand', function () {
                const { context } = contextRef;

                // CASE 1: Can deal two damage to a unit or base after a card is discarded from hand
                context.player1.clickCard(context.pillage);
                context.player1.clickPrompt('Opponent');
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.daringRaid);
                context.player2.clickPrompt('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.groguIrresistible, context.migsMayfeldTriggerman, context.wampa, context.systemPatrolCraft, context.chopperBase, context.commandCenter]);
                context.player1.clickCard(context.chopperBase);
                expect(context.chopperBase.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                // CASE 2: Cannot use the ability twice in a round
                context.player2.passAction();
                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();

                // TODO: When Force Throw is implemented, ensure that Force Throw deals damage before the Migs trigger
            });
        });
    });
});
