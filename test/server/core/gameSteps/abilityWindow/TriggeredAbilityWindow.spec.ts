describe('Simultaneous triggers', function() {
    integration(function(contextRef) {
        describe('Chewbacca being attacked by Sabine', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    }
                });
            });

            it('should prompt the active player(controller of Sabine) which player\'s triggers to resolve first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                // Don't need to click Chewbacca due to sentinel
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(context.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                context.player1.clickPrompt('You');
                expect(context.chewbacca.exhausted).toBe(true);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.chewbacca]);
                expect(context.chewbacca.damage).toBe(0);

                context.player1.clickCard(context.p1Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(2);
                expect(context.chewbacca.exhausted).toBe(false);
            });

            it('should have the triggers work in either order', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                // Don't need to click Chewbacca due to sentinel
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(context.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                context.player1.clickPrompt('Opponent');
                expect(context.chewbacca.exhausted).toBe(false);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.chewbacca]);
                expect(context.chewbacca.damage).toBe(0);

                context.player1.clickCard(context.p1Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(2);
                expect(context.chewbacca.exhausted).toBe(false);
            });
        });

        describe('Two units with a when defeated ability killing each other', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'yoda#old-master', damage: 3 }],
                        deck: ['wampa', 'vanquish', 'repair']
                    },
                    player2: {
                        groundArena: ['vanguard-infantry', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    }
                });
            });

            it('should let the active player choose which player\'s triggers happen first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                context.player1.clickPrompt('You');

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);
                expect(context.player1.hand.length).toBe(0);
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.allianceXwing, context.battlefieldMarine]);
                expect(context.allianceXwing).toHaveExactUpgradeNames([]);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should have the triggers work in either order', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                context.player1.clickPrompt('Opponent');

                expect(context.player2).toBeAbleToSelectExactly([context.allianceXwing, context.battlefieldMarine]);
                expect(context.allianceXwing).toHaveExactUpgradeNames([]);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);
                expect(context.player1.hand.length).toBe(0);
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
