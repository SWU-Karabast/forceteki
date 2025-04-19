
describe('AT-DP Occupier', function() {
    integration(function(contextRef) {
        it('AT-DP Occupier\'s ability should decrease cost by 1 for each damaged ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atdp-occupier'],
                    groundArena: [{ card: 'wampa', damage: 1 }, 'battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    groundArena: [{ card: 'atst', damage: 2 }],
                    spaceArena: ['republic-arc170']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.atdpOccupier);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('AT-DP Occupier\'s ability should not decrease cost for damaged space units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'kestro-city',
                    hand: ['atdp-occupier'],
                    groundArena: ['wampa', 'battlefield-marine'],
                    spaceArena: [
                        { card: 'elite-p38-starfighter', damage: 1 },
                        { card: 'tie-advanced', damage: 1 }
                    ]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [
                        { card: 'republic-arc170', damage: 2 },
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.atdpOccupier);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        it('AT-DP Occupier\'s ability should grant the discount for a damaged Blue Leader only if it is on the ground', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'han-solo#worth-the-risk',
                    hand: ['blue-leader#scarif-air-support']
                },
                player2: {
                    base: 'kestro-city',
                    hand: ['atdp-occupier'],
                    spaceArena: [{ card: 'blue-leader#scarif-air-support', damage: 1 }]
                }
            });

            const { context } = contextRef;
            const p1BlueLeader = context.player1.findCardByName('blue-leader#scarif-air-support');

            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
            context.player1.clickCard(p1BlueLeader);
            context.player1.clickPrompt('Pay 2 resources');
            context.player1.clickPrompt('Trigger');

            // Blue Leader is damaged and in the ground arena
            expect(p1BlueLeader).toBeInZone('groundArena');
            expect(p1BlueLeader.damage).toBe(2);

            context.player2.clickCard(context.atdpOccupier);

            expect(context.player1).toBeActivePlayer();
            expect(context.player2.exhaustedResourceCount).toBe(3);
        });
    });
});
