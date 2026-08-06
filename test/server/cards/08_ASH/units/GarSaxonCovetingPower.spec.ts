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
    });
});
