describe('Tribunal, Grave of the 332nd', function() {
    integration(function(contextRef) {
        describe('cost reduction ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        resources: 15,
                        hand: ['tribunal#grave-of-the-332nd', 'porg', 'porg'],
                    },
                    player2: {
                        hand: ['porg'],
                    }
                });
            });

            it('should cost 2 less for each other card played this phase', function() {
                const { context } = contextRef;

                const porgs = context.player1.findCardsByName('porg');

                // Play two 0-cost Porgs
                context.player1.clickCard(porgs[0]);
                context.player2.passAction();
                context.player1.clickCard(porgs[1]);
                context.player2.passAction();

                // Tribunal costs 10 - (2 * 2 Porgs) = 6
                context.player1.clickCard(context.tribunal);

                expect(context.tribunal).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should cost full price if no other cards played this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.tribunal);

                expect(context.tribunal).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should not count cards played by opponent', function() {
                const { context } = contextRef;

                context.player1.passAction();

                // Opponent plays a Porg
                const opponentPorg = context.player2.findCardByName('porg');
                context.player2.clickCard(opponentPorg);

                // Only opponent played a card, no discount
                context.player1.clickCard(context.tribunal);

                expect(context.tribunal).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should not count cards played in a previous phase', function() {
                const { context } = contextRef;

                const porgs = context.player1.findCardsByName('porg');
                context.player1.clickCard(porgs[0]);

                context.moveToNextActionPhase();

                // Porg played last phase should not count
                context.player1.clickCard(context.tribunal);

                expect(context.tribunal).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });
        });

        describe('when played ability', function() {
            it('should give each other unit -2/-2 for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tribunal#grave-of-the-332nd'],
                        groundArena: ['wampa'],
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        base: 'dagobah-swamp',
                        resources: 15,
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.tribunal);

                // Tribunal itself is not affected
                expect(context.tribunal.getPower()).toBe(6);
                expect(context.tribunal.getHp()).toBe(8);

                // Friendly unit gets -2/-2
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);

                // Friendly leader unit gets -2/-2
                expect(context.kazudaXiono.getPower()).toBe(0);
                expect(context.kazudaXiono.getHp()).toBe(3);

                // Enemy units get -2/-2
                expect(context.consularSecurityForce.getPower()).toBe(1);
                expect(context.consularSecurityForce.getHp()).toBe(5);

                // TIE/LN Fighter (1/2) should be defeated by -2/-2
                expect(context.tielnFighter).toBeInZone('discard');

                // Effect wears off after the phase
                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.kazudaXiono.getPower()).toBe(2);
                expect(context.kazudaXiono.getHp()).toBe(5);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);
            });
        });
    });
});
