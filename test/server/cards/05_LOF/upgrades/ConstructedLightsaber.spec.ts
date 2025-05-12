describe('Constructed Lightsaber', function () {
    integration(function (contextRef) {
        it('Constructed Lightsaber\'s ability should grant Restore 2 to units with Heroism aspect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{
                        card: 'luke-skywalker#jedi-knight',
                        upgrades: ['constructed-lightsaber']
                    }],
                    base: { card: 'echo-base', damage: 6 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalker);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(1); // 3 + 2
        });

        it('Constructed Lightsaber\'s ability should grant Raid 2 to units with Villainy aspect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{
                        card: 'darth-malak#covetous-apprentice',
                        upgrades: ['constructed-lightsaber']
                    }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMalak);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(8); // 4 + 2 + 2
        });

        it('Constructed Lightsaber\'s ability should grant Sentinel to units with neither Heroism nor Villainy aspects', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: [{
                        card: 'multitroop-transport',
                        upgrades: ['constructed-lightsaber']
                    }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.multitroopTransport]);
            context.player1.clickCard(context.multitroopTransport);
        });
    });
});