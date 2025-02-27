describe('Roger Roger\'s when defeated ability', function() {
    integration(function(contextRef) {
        it('should transfer the upgrade to a friendly Battle Droid token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['droid-deployment', 'takedown'],
                    groundArena: [
                        'battle-droid',
                        'clone-trooper',
                        { card: 'super-battle-droid', upgrades: ['roger-roger'] },
                    ]
                },
                player2: {
                    hand: [
                        'confiscate',
                        'vanquish',
                        'waylay',
                        'superlaser-blast',
                        'change-of-heart'
                    ],
                    groundArena: ['battle-droid'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const p1BattleDroid = context.player1.findCardByName('battle-droid');
            const rogerRoger = context.player1.findCardByName('roger-roger');

            // Ensure P2 has enough resources to play all cards
            context.player2.setResourceCount(25);

            // CASE 1: Attached unit is bounced, defeating the upgrade and triggering the ability

            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.superBattleDroid);

            expect(context.player1).toBeAbleToSelectExactly([p1BattleDroid]);
            context.player1.clickCard(p1BattleDroid);

            expect(p1BattleDroid).toHaveExactUpgradeNames(['roger-roger']);
            expect(context.player1.discard.length).toBe(0);

            // CASE 2: Roger Roger is defeated directly, triggering the ability

            context.player1.passAction();

            context.player2.clickCard(context.confiscate);
            context.player2.clickCard(rogerRoger);

            expect(context.player1).toBeAbleToSelectExactly([p1BattleDroid]);
            context.player1.clickCard(p1BattleDroid);

            expect(p1BattleDroid).toHaveExactUpgradeNames(['roger-roger']);
            expect(context.player1.discard.length).toBe(0);

            // CASE 3: Attached unit is defeated, defeating the upgrade and triggering the ability

            // Create 2 more droids as Roger Roger targets
            context.player1.clickCard(context.droidDeployment);
            const [battleDroid1, battleDroid2, battleDroid3] = context.player1.findCardsByName('battle-droid');

            // Check that the first one is the one with the upgrade
            expect(battleDroid1).toHaveExactUpgradeNames(['roger-roger']);

            // Defeat the Battle Droid
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(battleDroid1);

            expect(context.player1).toBeAbleToSelectExactly([battleDroid2, battleDroid3]);
            context.player1.clickCard(battleDroid2);

            expect(battleDroid2).toHaveExactUpgradeNames(['roger-roger']);
            expect(context.player1.discard.length).toBe(1); // Droid Deployment is in discard

            // CASE 4: P1 can still transfer to friendly unit after the attached unit changes control

            context.player1.passAction();
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(battleDroid2);

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(battleDroid2);

            expect(context.player1).toBeAbleToSelectExactly([battleDroid3]);
            context.player1.clickCard(battleDroid3);

            expect(battleDroid3).toHaveExactUpgradeNames(['roger-roger']);
            expect(context.player1.discard.length).toBe(2); // Droid Deployment, Takedown

            // CASE 5: Roger Roger is discarded if there are no friendly Battle Droids in play

            context.player2.clickCard(context.superlaserBlast);

            expect(rogerRoger).toBeInZone('discard');
            expect(context.player1.discard.length).toBe(3); // Droid Deployment, Takedown, Roger Roger

            // TODO: Test that Roger Roger works correctly if stolen with Evidence of the Crime
        });
    });
});
