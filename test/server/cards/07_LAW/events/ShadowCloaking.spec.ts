describe('Shadow Cloaking', function () {
    integration(function (contextRef) {
        describe('Shadow Cloaking\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shadow-cloaking'],
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should ready a friendly ground unit and give it a Shield token', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.exhausted).toBe(true);

                context.player1.clickCard(context.shadowCloaking);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing, context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready a friendly space unit and give it a Shield token', function () {
                const { context } = contextRef;

                expect(context.allianceXwing.exhausted).toBe(true);

                context.player1.clickCard(context.shadowCloaking);
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.exhausted).toBe(false);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready an enemy unit and give it a Shield token', function () {
                const { context } = contextRef;

                expect(context.wampa.exhausted).toBe(true);

                context.player1.clickCard(context.shadowCloaking);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBe(false);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a Shield token to a ready unit without readying it again', function () {
                const { context } = contextRef;

                expect(context.cartelSpacer.exhausted).toBe(false);

                context.player1.clickCard(context.shadowCloaking);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.exhausted).toBe(false);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Shadow Cloaking\'s ability should have no effect when there are no units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shadow-cloaking']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shadowCloaking);

            expect(context.player1).toHavePrompt('Playing Shadow Cloaking will have no effect. Are you sure you want to play it?');
            expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

            context.player1.clickPrompt('Play anyway');

            expect(context.shadowCloaking).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
