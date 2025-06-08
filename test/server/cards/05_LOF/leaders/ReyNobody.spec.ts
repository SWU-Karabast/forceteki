
describe('Rey, Nobody', function() {
    integration(function(contextRef) {
        describe('Rey\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['drain-essence', 'bolstered-endurance', 'yoda#old-master'],
                        groundArena: ['guardian-of-the-whills', 'atst'],
                        leader: 'rey#nobody',
                        resources: 6 // making Rey undeployable makes testing the activated ability's condition smoother
                    },
                    player2: {
                        hand: ['force-choke', 'daughter-of-dathomir'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should only have an effect if the controller played a Force non-unit card this phase, but still be usable otherwise', function () {
                const { context } = contextRef;

                // No Force card played; ability has no effect
                context.player1.clickCard(context.rey);
                context.player1.clickPrompt('Use it anyway');

                expect(context.rey.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should damage a unit if a Force event card was played by controller', function () {
                const { context } = contextRef;

                // Play a Force event card
                context.player1.clickCard(context.drainEssence);
                context.player1.clickCard(context.guardianOfTheWhills);
                context.player2.passAction();

                // Use ability with effect
                context.player1.clickCard(context.rey);

                // Select a unit to damage
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.lukeSkywalker, context.atst]);
                context.player1.clickCard(context.atst);

                // Check board state
                expect(context.rey.exhausted).toBe(true);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should damage a unit if a Force upgrade card was played by controller', function () {
                const { context } = contextRef;

                // Play a Force upgrade card
                context.player1.clickCard(context.bolsteredEndurance);
                context.player1.clickCard(context.guardianOfTheWhills);
                context.player2.passAction();

                // Use ability with effect
                context.player1.clickCard(context.rey);

                // Select a unit to damage
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.lukeSkywalker, context.atst, context.guardianOfTheWhills]);
                context.player1.clickCard(context.atst);

                // Check board state
                expect(context.rey.exhausted).toBe(true);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to damage a unit as a Force unit card was played', function () {
                const { context } = contextRef;

                // Play a Force unit card
                context.player1.clickCard(context.yoda);
                context.player2.passAction();

                // Use ability without effect
                context.player1.clickCard(context.rey);
                context.player1.clickPrompt('Use it anyway');

                expect(context.rey.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to damage a unit as a Force non-unit card was played by the opponent', function () {
                const { context } = contextRef;

                // Opponent plays a Force non-unit card
                context.player1.passAction();
                context.player2.clickCard(context.forceChoke);
                context.player2.clickCard(context.guardianOfTheWhills);

                // Use ability without effect
                context.player1.clickCard(context.rey);
                context.player1.clickPrompt('Use it anyway');

                expect(context.rey.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Rey\'s deployed ability', function() {
            it('should be able to discard its controller\'s hand and draw two cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atst', 'guardian-of-the-whills', 'vanquish'],
                        deck: ['tieln-fighter', 'wampa', 'battlefield-marine'],
                        leader: 'rey#nobody'
                    }
                });

                const { context } = contextRef;

                // Deploy Rey
                context.player1.clickCard(context.rey);
                context.player1.clickPrompt('Deploy Rey');

                // Trigger Rey's deployed ability
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand');
                context.player1.clickPrompt('Trigger');

                // Rey should be in the ground arena now
                expect(context.rey).toBeInZone('groundArena');

                // Check discarded cards
                expect(context.atst).toBeInZone('discard');
                expect(context.guardianOfTheWhills).toBeInZone('discard');
                expect(context.vanquish).toBeInZone('discard');

                // Check drawn cards
                expect(context.player1.hand.length).toBe(2);
                expect(context.tielnFighter).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
            });

            it('should be able to discard its controller\'s 0 hand size hand and draw two cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['tieln-fighter', 'wampa', 'battlefield-marine'],
                        leader: 'rey#nobody'
                    }
                });

                const { context } = contextRef;

                // Deploy Rey
                expect(context.player1.hand.length).toBe(0);
                context.player1.clickCard(context.rey);
                context.player1.clickPrompt('Deploy Rey');

                // Trigger Rey's deployed ability
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand');
                context.player1.clickPrompt('Trigger');

                // Rey should be in the ground arena now
                expect(context.rey).toBeInZone('groundArena');

                // Check drawn cards
                expect(context.player1.hand.length).toBe(2);
                expect(context.tielnFighter).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
            });
        });
    });
});
