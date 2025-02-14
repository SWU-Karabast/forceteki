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

                expect(context.player1.readyResourceCount).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper).toBeInZone('spaceArena');
                expect(context.collectionsStarhopper.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1.readyResourceCount).toBe(15);
                expect(context.mercenaryGunship).toBeInZone('resource');
            });

            it('an upgrade can be played for its smuggle cost', function () {
                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.armedToTheTeeth);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.armedToTheTeeth).toBeInZone('groundArena');
                expect(context.wampa.upgrades).toContain(context.armedToTheTeeth);

                // This costs 6 due to the lack of a red aspect
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player1.readyResourceCount).toBe(12);
                expect(context.mercenaryGunship).toBeInZone('resource');
            });

            it('an event can be played for its smuggle cost', function () {
                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(18); // Sanity check before we Smuggle

                context.player1.clickCard(context.covertStrength);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);

                // This costs 5 due to the lack of a blue aspect
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player1.readyResourceCount).toBe(13);
                expect(context.mercenaryGunship).toBeInZone('resource');

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

                expect(context.player1.readyResourceCount).toBe(18); // Sanity check before we Smuggle
                context.player1.clickCard(context.chewbacca); // This card has a 9+RedHero cost, so it should cost us 11 here
                context.player1.passAction(); // Passing Chewbacca's when Played ability
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(11);
                expect(context.player1.readyResourceCount).toBe(7);
            });

            it('can be Smuggled even if the deck is empty', function () {
                const { context } = contextRef;

                context.player1.setDeck([]);

                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper).toBeInZone('spaceArena');
                expect(context.player1.resources.length).toBe(17);
            });

            it('and the card is readied, will swap its state with an exhausted card before playing if possible', function () {
                const { context } = contextRef;

                context.covertStrength.exhausted = true;

                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1.readyResourceCount).toBe(14);
            });
        });
    });
});
