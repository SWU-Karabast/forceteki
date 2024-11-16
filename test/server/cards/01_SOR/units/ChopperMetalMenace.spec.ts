describe('Chopper, Metal Menace', function() {
    integration(function(contextRef) {
        describe('Chopper\'s On Attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['chopper#metal-menace'],
                        leader: 'hera-syndulla#spectre-two',
                    },
                    player2: {
                        deck: ['battlefield-marine', 'pyke-sentinel', 'underworld-thug', 'the-chaos-of-war', 'volunteer-soldier'],
                        resources: 5
                    }
                });
            });

            it('should discard a card on attack and not exhaust an enemy resource if the card is not an event; should not have Raid 1', function () {
                const { context } = contextRef;

                expect(context.player2.deck.length).toBe(5);
                expect(context.player2.countSpendableResources()).toBe(5);

                context.player1.clickCard(context.chopper);
                expect(context.player2.base.damage).toBe(1);

                // Check mill and resources
                expect(context.player2.deck.length).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2.countSpendableResources()).toBe(5);
            });
        });

        describe('Chopper\'s On Attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['chopper#metal-menace', 'sabine-wren#explosives-artist'],
                        leader: 'hera-syndulla#spectre-two',
                    },
                    player2: {
                        deck: ['the-chaos-of-war', 'battlefield-marine', 'pyke-sentinel', 'underworld-thug', 'volunteer-soldier'],
                        resources: 5
                    }
                });
            });

            it('should discard a card on attack and exhaust an enemy resource if the card is an event; should also have Raid 1 from friendly Spectre', function () {
                const { context } = contextRef;

                expect(context.player2.deck.length).toBe(5);
                expect(context.player2.countSpendableResources()).toBe(5);

                context.player1.clickCard(context.chopper);
                expect(context.player2.base.damage).toBe(2);

                // Check mill and resources
                expect(context.player2.deck.length).toBe(4);
                expect(context.player2.countSpendableResources()).toBe(4);
            });
        });

        describe('Chopper\'s On Attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['chopper#metal-menace']
                    },
                    player2: {
                        deck: [],
                        resources: 5
                    }
                });
            });

            it('should not trigger empty deck draw damage when opponent has an empty deck', function () {
                const { context } = contextRef;

                expect(context.player2.base.damage).toBe(0);

                context.player1.clickCard(context.chopper);

                // Check mill and damage
                expect(context.player2.deck.length).toBe(0);
                expect(context.player2.base.damage).toBe(1);
            });
        });
    });
});