describe('IndirectDamageToPlayer system', function() {
    integration(function (contextRef) {
        describe('When indirect damage is dealt', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['first-order-stormtrooper'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }, { card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                        spaceArena: ['lurking-tie-phantom'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true, damage: 4 },
                    }
                });
            });

            it('is not prevented by shields', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                ]));

                expect(context.wampa.damage).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            });

            it('is not prevented by Boba Fett\'s armor', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickCard(context.wampa);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.bobaFett, 1],
                ]));

                expect(context.bobaFett.damage).toBe(1);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.bobaFett, 1],
                ]));

                expect(context.bobaFett.damage).toBe(2);
            });

            it('is not prevented by Lurking Tie Phantom ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickCard(context.wampa);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.lurkingTiePhantom, 1],
                ]));

                expect(context.lurkingTiePhantom.damage).toBe(1);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.lurkingTiePhantom, 1],
                ]));

                expect(context.lurkingTiePhantom).toBeInZone('discard');
            });

            it('can\'t be over assigned to Chirrut Imwe', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickCard(context.wampa);

                context.player1.clickPrompt('Opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.chirrutImwe, 1],
                ]));

                expect(context.chirrutImwe.damage).toBe(5);
                expect(context.chirrutImwe.remainingHp).toBe(0);

                context.player1.clickPrompt('Opponent');
                expect(
                    () => context.player2.setDistributeIndirectDamagePromptState(new Map([
                        [context.chirrutImwe, 1],
                    ]))
                ).toThrowError();

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 1],
                ]));
            });
        });
    });
});
