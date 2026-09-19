describe('Forced Pacification', function () {
    integration(function (contextRef) {
        describe('Forced Pacification\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['forced-pacification'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa', 'sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer', 'strikeship'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should defeat any number of units then exhaust twice that number, choosing 2 friendly and 4 enemy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forcedPacification);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.lukeSkywalker]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickDone();

                expect(context.lukeSkywalker.deployed).toBeFalse();
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.sundariPeacekeeper,
                    context.cartelSpacer,
                    context.strikeship,
                    context.sabineWren
                ]);
                expect(context.player1).toHavePrompt('Exhaust up to 4 enemy units (0 selected)');
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Exhaust up to 4 enemy units (1 selected)');

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.strikeship);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                expect(context.sabineWren.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.strikeship.exhausted).toBeTrue();
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat any number of units then exhaust twice that number, choosing more defeats than needed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forcedPacification);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.lukeSkywalker]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.awing);
                context.player1.clickDone();

                expect(context.lukeSkywalker.deployed).toBeFalse();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.awing).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.sundariPeacekeeper,
                    context.cartelSpacer,
                    context.strikeship,
                    context.sabineWren
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.strikeship);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                expect(context.sabineWren.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.strikeship.exhausted).toBeTrue();
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.sundariPeacekeeper.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat any number of units then exhaust twice that number, choosing 0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forcedPacification);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.lukeSkywalker]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                expect(context.lukeSkywalker.deployed).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.awing).toBeInZone('spaceArena');

                expect(context.sabineWren.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.strikeship.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});