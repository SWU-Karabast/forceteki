describe('Aggressive Negotiations', function () {
    integration(function (contextRef) {
        it('should initiate an attack and give the attacker +1/+0 for each card in your hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['evil-is-everywhere', 'atst'],
                    groundArena: [{ card: 'karis#we-dont-like-strangers', upgrades: ['kylo-rens-lightsaber'] }, 'wampa'],
                    spaceArena: [
                        'avenger#hunting-star-destroyer',
                        'ruthless-raider',
                        'fleet-interdictor'
                    ],
                },
                player2: {
                    leader: {
                        card: 'sabine-wren#galvanized-revolutionary',
                        deployed: true
                    },
                    groundArena: [
                        'fighters-for-freedom',
                        'kylo-ren#i-know-your-story',
                        'reckless-gunslinger',
                        'porg'
                    ]
                }
            });

            const { context } = contextRef;

            // Play Evil is Everywhere with 4 Villainy aspects among friendly units
            context.player1.clickCard(context.evilIsEverywhere);
            expect(context.player1).toBeAbleToSelectExactly([
                context.sabineWren,         // 4 cost (leader)
                context.wampa,              // 4 cost (friendly)
                context.fightersForFreedom, // 3 cost
                context.kyloRen,            // 2 cost
                context.karis,              // 2 cost (friendly)
                context.recklessGunslinger, // 1 cost
                context.porg                // 0 cost
            ]);

            context.player1.clickCard(context.fightersForFreedom);

            expect(context.player2).toBeActivePlayer();
            expect(context.fightersForFreedom).toBeInZone('discard', context.player2);
        });
    });
});
