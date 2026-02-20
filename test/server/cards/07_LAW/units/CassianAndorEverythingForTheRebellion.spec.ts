describe('Cassian Andor, Everything for the Rebellion', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    attackRulesVersion: 'cr7',
                    phase: 'action',
                    player1: {
                        groundArena: ['cassian-andor#everything-for-the-rebellion', 'battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        groundArena: ['sabine-wren#explosives-artist', 'wampa', 'death-star-stormtrooper'],
                    }
                });
            });

            it('should deal 2 damage to a base when a friendly unit attack ends and the defending unit was defeated', function () {
                const { context } = contextRef;

                // Battlefield Marine attacks Sabine Wren and defeats her
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sabineWrenExplosivesArtist);

                // Prompt to select a base to deal 2 damage to
                expect(context.player1).toHavePrompt('Select a base to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.sabineWrenExplosivesArtist).toBeInZone('discard');
            });

            it('should deal 2 damage to a base when a friendly leader unit attack ends and the defending unit was defeated', function () {
                const { context } = contextRef;

                // Sabine leader unit attacks Death Star Stormtrooper and defeats it
                context.player1.clickCard(context.sabineWrenGalvanizedRevolutionary);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Prompt to select a base to deal 2 damage to
                expect(context.player1).toHavePrompt('Select a base to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3); // 1 damage from Sabine's ability and 2 damage from Cassian Andor's ability
                expect(context.deathStarStormtrooper).toBeInZone('discard');
            });

            it('should deal 2 damage to a base when he attacks and the defending unit was defeated', function () {
                const { context } = contextRef;

                // Cassian Andor attacks Sabine Wren and defeats her
                context.player1.clickCard(context.cassianAndor);
                context.player1.clickCard(context.sabineWrenExplosivesArtist);

                // Prompt to select a base to deal 2 damage to
                expect(context.player1).toHavePrompt('Select a base to deal 2 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.sabineWrenExplosivesArtist).toBeInZone('discard');
            });

            it('should not be able to deal 2 damage to a base when a friendly unit attack ends and the defending unit was not defeated', function () {
                const { context } = contextRef;

                // Battlefield Marine attacks Wampa but does not defeat it and battlefield Marine is defeated
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                // No ability prompt
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when enemy unit attack ends and defeats a unit', function () {
                const { context } = contextRef;

                // Pass action to player 2
                context.player1.passAction();

                // Wampa attacks Battlefield Marine and defeats it
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                // No ability prompt
                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should do nothing when friendly unit attack ends to base', function () {
                const { context } = contextRef;

                // Wampa attacks Battlefield Marine and defeats it
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // No ability prompt
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
