describe('Nothing Left To Fear', function() {
    integration(function(contextRef) {
        describe('Nothing Left To Fear\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nothing-left-to-fear'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'atst'],
                        spaceArena: ['cartel-spacer', 'avenger#hunting-star-destroyer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should give a friendly unit +2/+2 for this phase and optionally defeat a non-leader unit with power equal to or less than the chosen unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nothingLeftToFear);

                // Should only be able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.allianceXwing]);

                context.player1.clickCard(context.wampa);

                // Wampa should now have +2/+2 (base 4/5 -> 6/7)
                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                // Then prompt to defeat a non-leader unit with power <= 6
                expect(context.player1).toHavePrompt('Defeat a non-leader unit with power equal to or less than the chosen unit');
                expect(context.player1).toHavePassAbilityButton();

                // pyke-sentinel (2 power), atst (6 power), cartel-spacer (2 power), battlefield-marine (3 power), alliance-xwing (2 power), wampa itself (6 power)
                // Cannot target Darth Vader (leader unit) and avenger (greater power)
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.cartelSpacer, context.battlefieldMarine, context.allianceXwing, context.wampa]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing on the optional defeat ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nothingLeftToFear);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                // Pass on the optional defeat
                context.player1.clickPrompt('Pass');

                expect(context.atst).toBeInZone('groundArena');
                expect(context.pykeSentinel).toBeInZone('groundArena');
                expect(context.avenger).toBeInZone('spaceArena');
                expect(context.cartelSpacer).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should have stat bonus expire at end of phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nothingLeftToFear);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                context.player1.clickPrompt('Pass');

                context.moveToNextActionPhase();

                // Stat bonus should be gone
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });
        });
    });
});
