describe('Pelta Supply Frigate', function() {
    integration(function(contextRef) {
        it('Pelta Supply Frigate\'s ability should create a Clone Trooper token when Coordinate is active', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['pelta-supply-frigate'],
                    groundArena: ['wampa', 'clone-heavy-gunner']
                },
                player2: {
                    groundArena: ['atst'],
                    hand: ['waylay', 'takedown']
                }
            });

            const { context } = contextRef;

            // Plays the Pelta Supply Frigate card and checks if the Clone Trooper token is created as Coordinate is active
            context.player1.clickCard(context.peltaSupplyFrigate);

            expect(context.player2).toBeActivePlayer();
            let cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();

            // Disable Coordinate
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.peltaSupplyFrigate);
            context.player1.passAction();
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.cloneHeavyGunner);
            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wampa);

            // Validate there's no Coordinate active
            expect(context.player1.getCardsInZone('groundArena').length).toBe(1);
            expect(context.player1.getCardsInZone('spaceArena').length).toBe(0);

            // Pelta Supply Frigate played without Coordinate
            context.player1.clickCard(context.peltaSupplyFrigate);

            expect(context.player2).toBeActivePlayer();
            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1); // Remaining clone trooper from the first play
        });
    });
});
