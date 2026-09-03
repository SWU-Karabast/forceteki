describe('Noxious Refinery', function() {
    integration(function(contextRef) {
        it('should deal 1 damage to an enemy unit when the revealed card has the Aggression aspect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['wampa'],
                    base: { card: 'kestro-city', upgrades: ['noxious-refinery'] },
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.moveToRegroupPhase();

            expect(context.wampa).toBeInZone('deck');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.cartelSpacer.damage).toBe(0);
        });

        it('should not deal damage when the revealed card does not have the Aggression aspect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['porg'],
                    base: { card: 'kestro-city', upgrades: ['noxious-refinery'] },
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.moveToRegroupPhase();

            // Porg is not Aggression, so no damage is dealt; the regroup phase proceeds automatically to the draw step
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.battlefieldMarine.damage).toBe(0);
        });

        it('should not trigger anything when the deck is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: [],
                    base: { card: 'kestro-city', upgrades: ['noxious-refinery'] },
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.moveToRegroupPhase();

            expect(context.battlefieldMarine.damage).toBe(0);
        });
    });
});
