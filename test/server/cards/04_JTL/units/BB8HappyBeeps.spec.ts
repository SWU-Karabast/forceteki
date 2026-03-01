describe('BB-8, Happy Beeps', function () {
    integration(function (contextRef) {
        describe('BB-8\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', exhausted: true },
                        hand: ['bb8#happy-beeps'],
                        groundArena: ['atst', { card: 'poe-dameron#quick-to-improvise', exhausted: true }],
                        spaceArena: ['black-one#scourge-of-starkiller-base'],
                    },
                    player2: {
                        groundArena: [{ card: 'rose-tico#dedicated-to-the-cause', exhausted: true }],
                    }
                });
            });

            it('allow you to pay 2 resources to ready a Resistance unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickPrompt('Play BB-8 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to ready a Resistance unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([
                    // Kazuda is not selectable while undeployed
                    context.poeDameron,
                    context.roseTico,
                    context.blackOne
                ]);
                context.player1.clickCard(context.poeDameron);

                expect(context.poeDameron.exhausted).toBeFalse();
                expect(context.roseTico.exhausted).toBeTrue();
            });

            it('allow you to pass the ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickPrompt('Play BB-8 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to ready a Resistance unit');
                context.player1.clickPrompt('Pass');

                expect(context.poeDameron.exhausted).toBeTrue();
                expect(context.roseTico.exhausted).toBeTrue();
            });

            it('can ready deployed leader units', function () {
                const { context } = contextRef;

                // Deploy Kazuda so that he can be readied
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono');
                context.player2.passAction();

                // Attack with Kazuda to exhaust him
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Choose nothing');
                context.player2.passAction();

                // Now play BB-8 with piloting
                context.player1.clickCard(context.bb8);
                context.player1.clickPrompt('Play BB-8 with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to ready a Resistance unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.kazudaXiono,
                    context.poeDameron,
                    context.roseTico,
                    context.blackOne
                ]);
                context.player1.clickCard(context.kazudaXiono);

                expect(context.kazudaXiono.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
