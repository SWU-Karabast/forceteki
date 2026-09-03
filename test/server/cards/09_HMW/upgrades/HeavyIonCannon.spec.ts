describe('Heavy Ion Cannon', function() {
    integration(function(contextRef) {
        it('Heavy Ion Cannon\'s when played ability should draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heavy-ion-cannon'],
                    deck: ['battlefield-marine', 'daring-raid']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heavyIonCannon);
            context.player1.clickCard(context.p1Base);

            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.daringRaid).toBeInZone('deck', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Heavy Ion Cannon\'s when played ability should deal 3 damage to the base if the deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heavy-ion-cannon'],
                    deck: []
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heavyIonCannon);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Heavy Ion Cannon\'s given action ability should deal 2 damage to a unit with cost of discarding from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'daring-raid'],
                    groundArena: ['rebel-pathfinder'],
                    base: { card: 'echo-base', upgrades: ['heavy-ion-cannon'] }
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                    leader: { card: 'cad-bane#still-faster-than-you', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.p1Base);

            expect(context.player1).toHavePrompt('Deal 2 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.greenSquadronAwing, context.cadBane]);
            context.player1.clickCard(context.cadBane);

            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.daringRaid]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            expect(context.daringRaid).toBeInZone('hand', context.player1);
            expect(context.cadBane.damage).toBe(2);
            expect(context.rebelPathfinder.damage).toBe(0);
            expect(context.greenSquadronAwing.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).not.toBeAbleToSelect(context.p1Base);
        });

        it('Heavy Ion Cannon\'s should do nothing if there are no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rebel-pathfinder'],
                    base: { card: 'echo-base', upgrades: ['heavy-ion-cannon'] }
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                    leader: { card: 'cad-bane#still-faster-than-you', deployed: true }
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).not.toBeAbleToSelect(context.p1Base);
        });

        it('Heavy Ion Cannon\'s given action ability should discard a card even if there are no units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'daring-raid'],
                    base: { card: 'echo-base', upgrades: ['heavy-ion-cannon'] }
                },
                player2: {
                    hand: ['green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.p1Base);

            context.player1.clickPrompt('Use it anyway');

            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.daringRaid]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            expect(context.daringRaid).toBeInZone('hand', context.player1);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.greenSquadronAwing);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).not.toBeAbleToSelect(context.p1Base);
        });
    });
});