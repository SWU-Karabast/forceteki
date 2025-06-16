describe('Dagoyan Master', function() {
    integration(function(contextRef) {
        describe('Dagoyan Master\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dagoyan-master'],
                        groundArena: ['salacious-crumb#obnoxious-pet'],
                        spaceArena: ['cartel-spacer'],
                        deck: ['jedi-knight', 'scout-bike-pursuer', 'fifth-brother#fear-hunter', 'sorcerous-blast', 'rebel-pathfinder', 'alliance-dispatcher', 'echo-base-defender', 'frontline-shuttle'],
                        hasForceToken: true
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa'],
                        spaceArena: ['patrolling-vwing'],
                        deck: ['system-patrol-craft', 'clan-wren-rescuer', 'village-protectors', 'concord-dawn-interceptors', 'gentle-giant', 'frontier-atrt', 'cargo-juggernaut', 'public-enemy'],
                        hasForceToken: true
                    }
                });
            });

            it('should search the top 5 for a Force unit, reveal it, and draw it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dagoyanMaster);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.jediKnight, context.fifthBrother],
                    invalid: [context.sorcerousBlast, context.rebelPathfinder, context.scoutBikePursuer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.jediKnight);

                expect(context.getChatLogs(2)).toContain('player1 takes Jedi Knight');

                // Check cards in hand
                expect(context.jediKnight).toBeInZone('hand');

                // Check cards in deck
                expect(context.player1.deck.length).toBe(7);
                expect([context.fifthBrother, context.sorcerousBlast, context.rebelPathfinder, context.scoutBikePursuer]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow opponent to use No Glory Only Results to search the top 5 for a Force unit, reveal it, and draw it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dagoyanMaster);
                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.dagoyanMaster);
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toHaveExactDisplayPromptCards({
                    invalid: [context.systemPatrolCraft, context.clanWrenRescuer, context.villageProtectors, context.concordDawnInterceptors, context.gentleGiant]
                });
                context.player2.clickPrompt('Take Nothing');
                expect(context.player2.deck.length).toBe(8);
                expect([context.systemPatrolCraft, context.clanWrenRescuer, context.villageProtectors, context.concordDawnInterceptors, context.gentleGiant]).toAllBeInBottomOfDeck(context.player2, 5);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not be triggered as player decides not to use the Force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dagoyanMaster);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Dagoyan Master\'s ability should not be triggered as player doesn\'t have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dagoyan-master'],
                    groundArena: ['scout-bike-pursuer'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa', 'salacious-crumb#obnoxious-pet'],
                    spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dagoyanMaster);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.dagoyanMaster);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
