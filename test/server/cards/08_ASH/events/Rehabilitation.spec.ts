describe('Rehabilitation', function () {
    integration(function (contextRef) {
        it('Rehabilitation\'s ability should give a non-leader unit -3/-0 and then take control for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rehabilitation'],
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rehabilitation);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            context.player2.claimInitiative();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Rehabilitation\'s ability should give a non-leader unit -3/-0 and then take control for the phase, and stay with owner if taken back', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rehabilitation'],
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rehabilitation);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.battlefieldMarine);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
        });

        it('Rehabilitation\'s ability should keep stolen at hauler that was taken', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rehabilitation'],
                    spaceArena: ['stolen-athauler']
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.stolenAthauler);

            context.player1.passAction();

            expect(context.player2).toBeAbleToSelect(context.stolenAthauler);
            expect(context.stolenAthauler).toHaveAvailableActionWhenClickedBy(context.player2);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player2);
            expect(context.getChatLog()).toEqual('player2 plays Stolen AT-Hauler from player1\'s discard pile');

            context.player1.clickCard(context.rehabilitation);
            context.player1.clickCard(context.stolenAthauler);

            expect(context.stolenAthauler.getPower()).toBe(1);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

            context.moveToNextActionPhase();

            expect(context.stolenAthauler.getPower()).toBe(4);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);
        });
    });
});
