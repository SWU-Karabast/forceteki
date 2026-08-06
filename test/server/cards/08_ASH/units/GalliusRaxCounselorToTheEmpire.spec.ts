describe('Gallius Rax, Counselor to the Empire', function() {
    integration(function(contextRef) {
        it('should give friendly units with 2 or more keywords +2/+2', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['gallius-rax#counselor-to-the-empire', 'lepi-lookout', 'scout-bike-pursuer'],
                    spaceArena: [{ card: 'awing', upgrades: ['devotion'] }]
                },
                player2: {
                    hand: ['vanquish', 'change-of-heart'],
                    groundArena: ['cloud-city-wing-guard'],
                    spaceArena: ['devastator#inescapable'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            expect(context.galliusRax.getPower()).toBe(4);
            expect(context.galliusRax.getHp()).toBe(7);
            expect(context.lepiLookout.getPower()).toBe(5);
            expect(context.lepiLookout.getHp()).toBe(3);
            expect(context.scoutBikePursuer.getPower()).toBe(1);
            expect(context.scoutBikePursuer.getHp()).toBe(4);
            expect(context.awing.getPower()).toBe(4);
            expect(context.awing.getHp()).toBe(5);
            expect(context.cloudCityWingGuard.getPower()).toBe(2);
            expect(context.cloudCityWingGuard.getHp()).toBe(4);
            expect(context.devastator.getPower()).toBe(10);
            expect(context.devastator.getHp()).toBe(10);

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.galliusRax);
            expect(context.galliusRax).toBeInZone('discard', context.player1);

            expect(context.lepiLookout.getPower()).toBe(3);
            expect(context.lepiLookout.getHp()).toBe(1);
            expect(context.scoutBikePursuer.getPower()).toBe(1);
            expect(context.scoutBikePursuer.getHp()).toBe(4);
            expect(context.awing.getPower()).toBe(2);
            expect(context.awing.getHp()).toBe(3);
            expect(context.cloudCityWingGuard.getPower()).toBe(2);
            expect(context.cloudCityWingGuard.getHp()).toBe(4);
            expect(context.devastator.getPower()).toBe(10);
            expect(context.devastator.getHp()).toBe(10);
        });

        it('should give friendly units with 2 or more keywords +2/+2 if he changes control', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['gallius-rax#counselor-to-the-empire', 'lepi-lookout', 'scout-bike-pursuer'],
                    spaceArena: [{ card: 'awing', upgrades: ['devotion'] }]
                },
                player2: {
                    hand: ['vanquish', 'change-of-heart'],
                    groundArena: ['cloud-city-wing-guard'],
                    spaceArena: ['devastator#inescapable'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            expect(context.galliusRax.getPower()).toBe(4);
            expect(context.galliusRax.getHp()).toBe(7);
            expect(context.lepiLookout.getPower()).toBe(5);
            expect(context.lepiLookout.getHp()).toBe(3);
            expect(context.scoutBikePursuer.getPower()).toBe(1);
            expect(context.scoutBikePursuer.getHp()).toBe(4);
            // 1/2 base 2/3 because upgrade so 4/5
            expect(context.awing.getPower()).toBe(4);
            expect(context.awing.getHp()).toBe(5);
            expect(context.cloudCityWingGuard.getPower()).toBe(2);
            expect(context.cloudCityWingGuard.getHp()).toBe(4);
            expect(context.devastator.getPower()).toBe(10);
            expect(context.devastator.getHp()).toBe(10);

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.galliusRax);
            expect(context.galliusRax).toBeInZone('groundArena', context.player2);

            expect(context.galliusRax.getPower()).toBe(4);
            expect(context.galliusRax.getHp()).toBe(7);
            expect(context.lepiLookout.getPower()).toBe(3);
            expect(context.lepiLookout.getHp()).toBe(1);
            expect(context.scoutBikePursuer.getPower()).toBe(1);
            expect(context.scoutBikePursuer.getHp()).toBe(4);
            expect(context.awing.getPower()).toBe(2);
            expect(context.awing.getHp()).toBe(3);
            expect(context.cloudCityWingGuard.getPower()).toBe(2);
            expect(context.cloudCityWingGuard.getHp()).toBe(4);
            expect(context.devastator.getPower()).toBe(12);
            expect(context.devastator.getHp()).toBe(12);
        });
    });
});