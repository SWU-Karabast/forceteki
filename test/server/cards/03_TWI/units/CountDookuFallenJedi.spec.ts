describe('Count Dooku, Fallen Jedi', function() {
    integration(function(contextRef) {
        describe('Count Dooku\'s when played ability', function () {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['count-dooku#fallen-jedi'],
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }, 'battle-droid'],
                        spaceArena: ['tie-advanced']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should damage an enemy unit per unit exploited when playing him', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play Count Dooku using Exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNoTargetButton();
                // click needs to be non-checking b/c prompt remains unchanged
                context.player1.clickCardNonChecking(context.atst);
                expect(context.atst.damage).toBe(5);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should allow passing one damage target', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play Count Dooku using Exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                context.player1.clickPrompt('Choose no target');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should allow passing both damage targets', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play Count Dooku using Exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickPrompt('Done');

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                context.player1.clickPrompt('Choose no target');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                context.player1.clickPrompt('Choose no target');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
            });

            it('should have as many damage instances as exploit targets', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play Count Dooku using Exploit');

                // choose only one exploit target
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');

                // choose damage target
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no exploit happens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play Count Dooku');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
