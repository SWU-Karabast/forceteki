describe('Gar Saxon, Coveting Power', function () {
    integration(function (contextRef) {
        describe('Gar Saxon\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['electrostaff', 'jedi-lightsaber', 'infiltrators-skill'],
                        groundArena: ['gar-saxon#coveting-power', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['academy-training', 'devotion'],
                        groundArena: ['wampa']
                    }
                });
            });

            it('should create a Mandalorian token when an upgrade is played on Gar Saxon', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.electrostaff);
                context.player1.clickCard(context.garSaxon);

                expect(context.player1).toHaveEnabledPromptButtons(['Create a Mandalorian token', 'Pass']);
                context.player1.clickPrompt('Trigger');

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not create a Mandalorian token when declined', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.electrostaff);
                context.player1.clickCard(context.garSaxon);
                context.player1.clickPrompt('Pass');

                expect(context.player1.findCardsByName('mandalorian').length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when an upgrade is played on another unit or by the opponent', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.findCardsByName('mandalorian').length).toBe(0);

                context.player2.clickCard(context.academyTraining);
                context.player2.clickCard(context.wampa);
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.findCardsByName('mandalorian').length).toBe(0);

                context.player1.passAction();

                context.player2.clickCard(context.devotion);
                context.player2.clickCard(context.garSaxon);
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.findCardsByName('mandalorian').length).toBe(0);
            });

            it('should only be usable once each round', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.electrostaff);
                context.player1.clickCard(context.garSaxon);
                context.player1.clickPrompt('Trigger');
                expect(context.player1.findCardsByName('mandalorian').length).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.garSaxon);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.findCardsByName('mandalorian').length).toBe(1);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.garSaxon);
                expect(context.player1).toHaveEnabledPromptButtons(['Create a Mandalorian token', 'Pass']);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.findCardsByName('mandalorian').length).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Gar Saxon\'s ability with an upgrade owned by the opponent', function () {
            it('should create a Mandalorian token when the player plays an upgrade from the opponent\'s discard pile on Gar Saxon', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-fine-addition'],
                        groundArena: ['gar-saxon#coveting-power', 'wampa'],
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                        discard: ['academy-training']
                    }
                });

                const { context } = contextRef;

                // Defeat an enemy unit to enable A Fine Addition
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player2);

                context.player2.passAction();

                // Play player2's Academy Training from their discard pile on Gar Saxon
                context.player1.clickCard(context.aFineAddition);
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.garSaxon);
                expect(context.academyTraining).toBeAttachedTo(context.garSaxon);

                expect(context.player1).toHaveEnabledPromptButtons(['Create a Mandalorian token', 'Pass']);
                context.player1.clickPrompt('Trigger');

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
