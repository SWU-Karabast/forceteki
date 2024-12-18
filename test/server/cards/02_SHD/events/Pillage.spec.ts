describe('Pillage', function() {
    integration(function(contextRef) {
        describe('Pillage\'s ability', function() {
            it('should let the player target the opponent, and let the opponent discard 2 cards from their hand', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pillage'],
                    },
                    player2: {
                        hand: ['alliance-xwing', 'battlefield-marine', 'imperial-interceptor', 'wampa']
                    },
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                const { player1, player2, pillage, allianceXwing, battlefieldMarine, imperialInterceptor, wampa } = context;

                player1.clickCard(pillage);
                player1.clickPrompt('Opponent');
                expect(player2).toBeAbleToSelectExactly([
                    allianceXwing, battlefieldMarine, imperialInterceptor, wampa
                ]);

                player2.clickCard(imperialInterceptor);
                player2.clickCard(wampa);
                player2.clickCardNonChecking(battlefieldMarine);
                player2.clickPrompt('Done');

                expect(wampa).toBeInZone('discard');
                expect(imperialInterceptor).toBeInZone('discard');

                expect(allianceXwing).toBeInZone('hand');
                expect(battlefieldMarine).toBeInZone('hand');

                expect(player2).toBeActivePlayer();
            });

            it('should let the player target the opponent, and automatically discard the only card in the opponents hand', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pillage'],
                    },
                    player2: {
                        hand: ['imperial-interceptor']
                    },
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                const { player1, player2, pillage, imperialInterceptor } = context;

                player1.clickCard(pillage);
                player1.clickPrompt('Opponent');

                expect(imperialInterceptor).toBeInZone('discard');

                expect(player2).toBeActivePlayer();
            });

            it('should let the player target the opponent, even if they have no cards in hand', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pillage'],
                    },
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                const { player1, player2, pillage } = context;

                player1.clickCard(pillage);
                player1.clickPrompt('Opponent');

                expect(player2.discard.length).toEqual(0);
                expect(player2).toBeActivePlayer();
            });

            it('should let the player target the themselves, and let the player discard 2 cards from their hand', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pillage', 'alliance-xwing', 'battlefield-marine', 'imperial-interceptor', 'wampa'],
                    },
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                const { player1, player2, pillage, allianceXwing, battlefieldMarine, imperialInterceptor, wampa } = context;

                player1.clickCard(pillage);
                player1.clickPrompt('You');
                expect(player1).toBeAbleToSelectExactly([
                    allianceXwing, battlefieldMarine, imperialInterceptor, wampa
                ]);

                player1.clickCard(imperialInterceptor);
                player1.clickCard(wampa);
                player1.clickPrompt('Done');

                expect(wampa).toBeInZone('discard');
                expect(imperialInterceptor).toBeInZone('discard');

                expect(allianceXwing).toBeInZone('hand');
                expect(battlefieldMarine).toBeInZone('hand');

                expect(player2).toBeActivePlayer();
            });
        });
    });
});
