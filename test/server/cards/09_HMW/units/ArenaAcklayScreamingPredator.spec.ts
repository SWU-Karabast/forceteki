describe('Arena Acklay, Screaming Predator', function() {
    integration(function(contextRef) {
        it('should deal two damage to enemy base when Arena Acklay is dealt damage and survives', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['arena-acklay#screaming-predator']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.arenaAcklay);

            expect(context.arenaAcklay.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal two damage to enemy base when Arena Acklay is dealt combat damage and survives', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['arena-acklay#screaming-predator']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.arenaAcklay);

            expect(context.arenaAcklay.damage).toBe(3);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not deal damage to base if friendly unit is damaged', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['arena-acklay#screaming-predator', 'battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.arenaAcklay.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('does not trigger if Acklay is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['arena-acklay#screaming-predator']
                },
                player2: {
                    groundArena: ['dinosaur-turtle'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.dinosaurTurtle);
            context.player2.clickCard(context.arenaAcklay);

            expect(context.arenaAcklay).toBeInZone('discard', context.player1);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });

        it('does not trigger when an enemy unit is dealt damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['arena-acklay#screaming-predator']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(2);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});