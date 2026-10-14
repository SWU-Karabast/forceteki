describe('Luke Skywalker, A Hero\'s Beginning', function() {
    integration(function(contextRef) {
        describe('Luke\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['battlefield-marine', 'yoda#old-master'],
                        groundArena: ['luke-skywalker#a-heros-beginning']
                    },
                    player2: {
                        hand: ['toro-calican#ambitious-upstart'],
                    }
                });
            });

            it('should not trigger when non-unique unit is played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when opponent plays unique unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.toroCalican);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger when opponent plays unique unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.toroCalican);
                expect(context.player1).toBeActivePlayer();
            });

            it('should trigger when player plays a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force to give an Experience token and a Shield token to this unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.lukeSkywalker).toHaveExactUpgradeNames(['shield', 'experience']);
            });

            it('should not trigger if player does not have the Force', function () {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);
                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Luke\'s triggered ability should trigger when player plays an opponent-owned unique unit with Unrefusable Offer', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['unrefusable-offer'],
                    groundArena: ['luke-skywalker#a-heros-beginning', 'wampa']
                },
                player2: {
                    groundArena: ['anakin-skywalker#ill-try-spinning']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.anakinSkywalker);

            context.player2.passAction();

            // Defeat Anakin and collect the bounty to play him under player1's control
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.anakinSkywalker);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');
            expect(context.anakinSkywalker).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePassAbilityPrompt('Use the Force to give an Experience token and a Shield token to this unit');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.lukeSkywalker).toHaveExactUpgradeNames(['shield', 'experience']);
        });
    });
});