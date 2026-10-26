describe('V-19 Skirmisher', function() {
    integration(function(contextRef) {
        describe('its ability', function() {
            it('should grant Sentinel while its controller has 3 or more units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher', 'cartel-spacer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.tielnFighter);

                // V19 is only option since it has sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher]);
                context.player2.clickCard(context.v19Skirmisher);
            });

            it('should not grant Sentinel while its controller has fewer than 3 units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher', 'cartel-spacer']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.tielnFighter);

                // Multiple attack options available when V19 lacks sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher, context.cartelSpacer, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should count token units and deployed leader units toward the 3-unit threshold', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher'],
                        groundArena: ['spy'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher]);
                context.player2.clickCard(context.v19Skirmisher);
            });

            it('should gain Sentinel once a third unit is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher', 'cartel-spacer'],
                        hand: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // At 2 units there is no Sentinel, so P2 is free to attack the base
                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher, context.cartelSpacer, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                context.player1.claimInitiative();
                context.moveToNextActionPhase();

                // Player1 plays Battlefield Marine, bringing their unit count to 3
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');

                // Sentinel is now active
                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher]);
                context.player2.clickCard(context.v19Skirmisher);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should lose Sentinel when friendly units in play drops below 3', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher', 'cartel-spacer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Defeat Battlefield Marine, dropping player1 back to 2 units
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.passAction();

                context.player2.clickCard(context.tielnFighter);
                // Multiple attack options available when V19 lacks sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher, context.cartelSpacer, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should only count units controlled by its own controller, not the opponent\'s', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['v19-skirmisher']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter'],
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.tielnFighter);

                // Multiple attack options available when V19 lacks sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.v19Skirmisher, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
