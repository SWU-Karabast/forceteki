describe('Smuggle keyword', function() {
    integration(function(contextRef) {
        describe('When a card with a Smuggle cost is in resources', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', damage: 4 }, 'pyke-sentinel'],
                        hand: [],
                        deck: ['mercenary-gunship'],
                        resources: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ], // TODO add a way to make it easier to mix named and generic resources
                        leader: 'leia-organa#alliance-general',
                        base: 'administrators-tower'
                    },
                    player2: {
                    }
                });
            });

            it('a unit can be played for its smuggle cost', function () {
                const { context } = contextRef;

                expect(context.player1.countSpendableResources()).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper).toBeInLocation('space arena');
                expect(context.collectionsStarhopper.exhausted).toBe(true);
                expect(context.player1.countExhaustedResources()).toBe(3);
                expect(context.player1.countSpendableResources()).toBe(15);
                expect(context.mercenaryGunship).toBeInLocation('resource');
            });

            it('an upgrade can be played for its smuggle cost', function () {
                const { context } = contextRef;

                expect(context.player1.countSpendableResources()).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.armedToTheTeeth);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.armedToTheTeeth).toBeInLocation('ground arena');
                expect(context.wampa.upgrades).toContain(context.armedToTheTeeth);

                // This costs 6 due to the lack of a red aspect
                expect(context.player1.countExhaustedResources()).toBe(6);
                expect(context.player1.countSpendableResources()).toBe(12);
                expect(context.mercenaryGunship).toBeInLocation('resource');
            });

            it('an event can be played for its smuggle cost', function () {
                const { context } = contextRef;

                expect(context.player1.countSpendableResources()).toBe(18); // Sanity check before we Smuggle

                context.player1.clickCard(context.covertStrength);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);

                // This costs 5 due to the lack of a blue aspect
                expect(context.player1.countExhaustedResources()).toBe(5);
                expect(context.player1.countSpendableResources()).toBe(13);
                expect(context.mercenaryGunship).toBeInLocation('resource');

                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(5);
                expect(context.wampa.getHp()).toBe(6);
            });

            it('a card without Smuggle cannot be played from resources', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('Cards with different smuggle aspects than play aspects only care about the smuggle aspects', function () {
                const { context } = contextRef;

                expect(context.player1.countSpendableResources()).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.chewbacca); // This card has a 9+RedHero cost, so it should cost us 11 here
                expect(context.chewbacca).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(11);
                expect(context.player1.countSpendableResources()).toBe(7);
            });

            // TODO: add test confirming if a ready resource is smuggled, its status is swapped with an exhausted resource before moving
        });
    });
});