import { Location } from '../../../../../server/game/core/Constants';

describe('Reinforcement Walker', function() {
    integration(function(contextRef) {
        describe('Reinforcement Walker\'s ability', function() {
            it('should let the play draw a card on attack when played and on attack', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcement-walker'],
                        deck: ['alliance-xwing', 'echo-base-defender', 'attack-pattern-delta', 'battlefield-marine']

                    },
                });

                const { context } = contextRef;

                // Case 1: The player is able to look at the top card of their deck when Reinforcement Walker is played
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.getChatLogs(1)[0]).toEqual('Reinforcement Walker sees Alliance X-Wing');

                // Case 2: The player can choose to either draw or discard the card
                expect(context.player1).toHaveExactPromptButtons([
                    'Draw',
                    'Discard',
                ]);

                // Case 3: The user is able to draw the card when they click 'Draw'
                context.player1.clickPrompt('Draw');

                expect(context.allianceXwing).toBeInLocation(Location.Hand);
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Case 4: The player is able to look at the top card of their deck when Reinforcement Walker attacks
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.getChatLogs(1)[0]).toEqual('Reinforcement Walker sees Battlefield Marine');

                // Case 5: The player can choose to either draw or discard the card
                expect(context.player1).toHaveExactPromptButtons([
                    'Draw',
                    'Discard',
                ]);

                // Case 6: The user is able to draw the card when they click 'Draw'
                context.player1.clickPrompt('Draw');
                expect(context.battlefieldMarine).toBeInLocation(Location.Hand);
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the play discard a card and heal 3 damage from their base on attack when played and on attack',
                function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['reinforcement-walker'],
                            deck: ['alliance-xwing', 'echo-base-defender', 'attack-pattern-delta', 'battlefield-marine']

                        },
                    });

                    const { context } = contextRef;
                    context.setDamage(context.p1Base, 10);

                    /* Case 1: The user is able to discard the card and heal 3 damage from their base when they click
                    'Discard' */
                    context.player1.clickCard(context.reinforcementWalker);
                    context.player1.clickPrompt('Discard');

                    expect(context.allianceXwing).toBeInLocation(Location.Discard);
                    expect(context.p1Base.damage).toEqual(7);
                    expect(context.player2).toBeActivePlayer();

                    context.moveToNextActionPhase();

                    /* Case 2: The user is able to discard the card and heal 3 damage from their base when they attack with
                    Reinforcement Walker */
                    context.player1.clickCard(context.reinforcementWalker);
                    expect(context.player1).toHaveExactPromptButtons([
                        'Draw',
                        'Discard',
                    ]);

                    context.player1.clickPrompt('Discard');
                    expect(context.battlefieldMarine).toBeInLocation(Location.Discard);
                    expect(context.p1Base.damage).toEqual(4);
                    expect(context.player2).toBeActivePlayer();
                });

            it('should skip abilities when the deck is empty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcement-walker'],
                        deck: []
                    },
                });

                const { context } = contextRef;

                // Case 1: It should skip abilities when Reinforcement Walker is played.
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Case 3: It should skip abilities when Reinforcement Walker is attacks.
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
