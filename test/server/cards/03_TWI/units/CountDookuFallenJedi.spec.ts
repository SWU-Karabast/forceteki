describe('Count Dooku, Fallen Jedi', function() {
    integration(function(contextRef) {
        describe('Count Dooku\'s when played ability', function () {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
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
                context.player1.clickPrompt('Trigger exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickDone();

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toHavePrompt('Deal 5 damage to an enemy unit (for exploiting Wampa)');
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit (for exploiting Battle Droid)');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.getChatLogs(1)[0]).toContain('player1 uses Count Dooku to deal 1 damage to Cartel Spacer');
                expect(context.getChatLogs(2)[0]).toContain('player1 uses Count Dooku to deal 5 damage to AT-ST');
            });

            it('should allow passing one damage target', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Trigger exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickDone();

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHavePrompt('Deal 5 damage to an enemy unit (for exploiting Wampa)');
                context.player1.clickPrompt('Choose nothing');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit (for exploiting Battle Droid)');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should allow passing both damage targets', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Trigger exploit');

                // choose exploit targets
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickDone();

                // choose first damage target (from wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                context.player1.clickPrompt('Choose nothing');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);

                // choose second damage target (from battle droid)
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                context.player1.clickPrompt('Choose nothing');
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
            });

            it('should have as many damage instances as exploit targets', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Trigger exploit');

                // choose only one exploit target
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                // choose damage target
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no exploit happens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Play without Exploit');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Count Doouk\'s when played ability', function () {
            it('should do nothing if triggered by Clone', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }, 'battle-droid', 'count-dooku#fallen-jedi'],
                        spaceArena: ['tie-advanced']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.countDooku);

                expect(context.clone).toBeCloneOf(context.countDooku);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
