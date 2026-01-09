describe('Han\'s Golden Dice', function () {
    integration(function (contextRef) {
        describe('On Attack', function () {
            it('discards the top card of your deck. If it is an odd cost, it creates a Credit token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['stolen-athauler'],
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['hans-golden-dice'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Han's Golden Dice ability should trigger, discarding Stolen AT-Hauler
                expect(context.stolenAthauler).toBeInZone('discard');

                // Since Stolen AT-Hauler has an odd cost (3), a Credit token should be created
                expect(context.player1.credits).toBe(1);
            });

            it('discards the top card of your deck. If it is an even cost, it does not create a Credit token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['chandrilan-sponsor'],
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['hans-golden-dice'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Han's Golden Dice ability should trigger, discarding Chandrilan Sponsor
                expect(context.chandrilanSponsor).toBeInZone('discard');

                // Since Chandrilan Sponsor has an even cost (2), a Credit token should not be created
                expect(context.player1.credits).toBe(0);
            });

            it('has no effect if the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [],
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['hans-golden-dice'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Han's Golden Dice ability should trigger, but there is no card to discard
                expect(context.player1.discard.length).toBe(0);

                // No Credit token should be created
                expect(context.player1.credits).toBe(0);
            });
        });
    });
});