describe('Traitorous', function() {
    integration(function(contextRef) {
        describe('Traitorous\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        hand: ['traitorous', 'change-of-heart'],
                    },
                    player2: {
                        groundArena: ['superlaser-technician', 'wampa'],
                        spaceArena: ['cartel-spacer', 'survivors-gauntlet'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hand: ['disabling-fang-fighter'],
                    }
                });
            });

            it('allows to take control of a non-leader unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player1);

                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.traitorous);

                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player2);
            });

            it('does not allow to take control of a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker).toBeInZone('groundArena', context.player2);
            });

            it('does not allow to take control of a non-leader unit that costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });

            it('gives back control of a unit when unattached', function () {
                const { context } = contextRef;

                // Player 1 plays Traitorous to take control of the Superlaser Technician
                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.superlaserTechnician);

                expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);

                // Player 2 passes
                context.player2.passAction();

                // Player 1 plays Change of Heart to take control of the Wampa
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Player 2 attacks with Survivors Gauntlet and move Traitorous to the Wampa,
                // this causes the Superlaser Technician to go back under control of Player 2
                context.player2.clickCard(context.survivorsGauntlet);
                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'That unit’s owner takes control of it',
                    'Take control of attached non-leader unit if it costs 3 or less',
                ]);
                context.player1.clickPrompt('Take control of attached non-leader unit if it costs 3 or less');

                expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Player 1 passes
                context.player1.passAction();

                // Player 2 plays Disabling Fang Fighter to defeat Traitorous,
                // this causes the Wampa to go back under control of Player 2
                // even if the Wampa costs more than 3
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.traitorous);

                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });
        });
    });
});
