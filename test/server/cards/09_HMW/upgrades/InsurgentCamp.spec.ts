describe('Insurgent Camp', function() {
    integration(function(contextRef) {
        it('Insurgent Camp should defeat itself to ready a friendly unit played with 3 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'insurgent-camp'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.insurgentCamp);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.insurgentCamp).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'insurgent-camp'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.insurgentCamp);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.insurgentCamp).not.toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp should not offer a defeat if the unit has more than 3 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'insurgent-camp'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.insurgentCamp);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);

            expect(context.wampa.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('Insurgent Camp should not offer a defeat if the unit is played by the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'insurgent-camp'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.insurgentCamp);
            context.player1.clickCard(context.p1Base);

            context.player2.clickCard(context.rebelPathfinder);

            expect(context.rebelPathfinder.exhausted).toBeTrue();

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).toHavePrompt('Choose an action');
        });
    });
});