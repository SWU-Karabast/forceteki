describe('Grand Admiral Thrawn, Grand Schemer\'s Reward', function() {
    integration(function(contextRef) {
        describe('Grand Admiral Thrawn, Grand Schemer\'s Reward\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['grand-admiral-thrawn#grand-schemer', 'superlaser-blast'],
                        groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                        spaceArena: ['imperial-interceptor']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['gladiator-star-destroyer'],
                        hand: ['power-of-the-dark-side', 'no-glory-only-results', 'change-of-heart'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should capture a space unit if the opponent selects one', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst]);
                context.player2.clickCard(context.gladiatorStarDestroyer);

                expect(context.gladiatorStarDestroyer).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();
            });

            it('should capture an enemy ground unit if the opponent selects one', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();
            });

            it('should ready if the opponent selects no units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Opponent readies Grand Admiral Thrawn');

                expect(context.grandAdmiralThrawnGrandSchemer.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow a friendly ground unit to capture an enemy ground unit when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);

                expect(context.grandAdmiralThrawnGrandSchemer).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.imperialInterceptor]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow a friendly space unit to capture an enemy space unit when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);

                expect(context.grandAdmiralThrawnGrandSchemer).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.imperialInterceptor]);
                context.player1.clickCard(context.imperialInterceptor);

                expect(context.player1).toBeAbleToSelectExactly([context.gladiatorStarDestroyer]);
                context.player1.clickCard(context.gladiatorStarDestroyer);

                expect(context.gladiatorStarDestroyer).toBeCapturedBy(context.imperialInterceptor);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the opponent to control the when defeated with No Glory Only Results', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.grandAdmiralThrawnGrandSchemer);

                expect(context.grandAdmiralThrawnGrandSchemer).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');

                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst, context.lukeSkywalkerFaithfulFriend]);
                context.player2.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder]);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.atst);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow capture of a unit that changed control with the when played', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst, context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow capture of a unit that changed control with the when defeated', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                context.player2.clickPrompt('Choose a non-leader unit to be captured');
                expect(context.player2).toBeAbleToSelectExactly([context.gladiatorStarDestroyer, context.atst, context.battlefieldMarine]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawnGrandSchemer);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);

                expect(context.grandAdmiralThrawnGrandSchemer).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');

                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.imperialInterceptor]);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.rebelPathfinder);

                expect(context.player1).toBeActivePlayer();
            });

            it('should ready Thrawn if there are no units to choose', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.superlaserBlast);
                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.grandAdmiralThrawnGrandSchemer);
                expect(context.grandAdmiralThrawnGrandSchemer.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});