describe('Hold For Questioning', function() {
    integration(function(contextRef) {
        describe('Hold For Questioning\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-for-questioning'],
                        groundArena: ['rebel-pathfinder']
                    },
                    player2: {
                        hand: ['wampa', 'superlaser-technician', 'resupply', 'yoda#old-master'],
                        groundArena: ['battlefield-marine', { card: 'atst', exhausted: true }],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should exhaust an enemy unit, look for opponent hand and discard a card that share an aspect with the exhausted unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdForQuestioning);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.atst]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.superlaserTechnician, context.resupply, context.yoda],
                    invalid: [context.wampa]
                });
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.superlaserTechnician);

                expect(context.player2).toBeActivePlayer();
                expect(context.superlaserTechnician).toBeInZone('discard', context.player2);
            });

            it('should exhaust an enemy unit, look for opponent hand and discard a card that share an aspect with the exhausted unit (no valid card)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdForQuestioning);
                context.player1.clickCard(context.awing);

                expect(context.awing.exhausted).toBeTrue();
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.wampa, context.superlaserTechnician, context.resupply, context.yoda],
                });
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player2);
                expect(context.superlaserTechnician).toBeInZone('hand', context.player2);
                expect(context.resupply).toBeInZone('hand', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
            });

            it('should not look for opponent hand if targeting an exhausted unit first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdForQuestioning);
                context.player1.clickCard(context.atst);
                expect(context.player2).toBeActivePlayer();
                expect(context.atst.exhausted).toBeTrue();
            });
        });

        it('Hold For Questioning\'s ability should exhaust an enemy unit even if opponent does not have any cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hold-for-questioning'],
                    groundArena: ['rebel-pathfinder']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.holdForQuestioning);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });
    });
});
