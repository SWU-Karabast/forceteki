describe('Cassian Andor, Dedicated to the Rebellion', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s leader ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        deck: ['k2so#cassians-counterpart'],
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: false },
                        base: { card: 'dagobah-swamp', damage: 5 },
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: false },
                        base: { card: 'capital-city', damage: 5 }
                    },
                });
            });

            it('should draw a card aftering dealing 3 damage to an enemy base', function() {
                const { context } = contextRef;

                // Expect this ability be available, but performs a no-op since 3 damage hasn't been dealt yet
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                
                context.cassianAndor.exhausted = false;
                context.player2.passAction();
                
                // Select the a-wing to deal 3 damage to base
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();
                
                // Expect this ability have activated now - so it should draw the top card from the deck
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.hand).toContain(context.k2so);
            });
        });

        describe('Cassian Andor\'s leader unit ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        deck: ['k2so#cassians-counterpart','red-three#unstoppable'],
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 5 },
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: false },
                        base: { card: 'capital-city', damage: 5 }
                    },
                });
            });

            it('should draw a card when you deal damage to an enemy base, but only once a round', function() {
                const { context } = contextRef;

                expect(context.player1.hand).toHaveSize(0);
                
                // Select yoda to deal damage (less than 3 for sanity check) to base
                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hand).toHaveSize(1);
                expect(context.player1.hand).toContain(context.k2so);
                expect(context.player1.exhaustedResourceCount).toBe(0); // no resources spent now

                context.player2.passAction();

                // Deal more damage to base to see if another event will trigger - it shouldn't
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                // No card draw should have happened due to once per round limit -- state should be the same
                expect(context.player1.hand).toHaveSize(1);
                expect(context.player1.hand).toContain(context.k2so);
                expect(context.player1.exhaustedResourceCount).toBe(0); 
            });

        });
    });
});
