describe('Roger Roger', function() {
    integration(function(contextRef) {
        describe('Roger Roger\'s ability', function() {
            it('should be transferred to a Battle Droid token when defeated', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['droid-deployment'],
                        groundArena: [
                            'battle-droid',
                            { card: 'super-battle-droid', upgrades: ['roger-roger'] },
                        ]
                    },
                    player2: {
                        hand: ['confiscate', 'vanquish', 'waylay', 'superlaser-blast'],
                        groundArena: ['battle-droid'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                const p1BattleDroid = context.player1.findCardByName('battle-droid');
                const rogerRoger = context.player1.findCardByName('roger-roger');

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
                // Droid Deployment is in discard
                expect(context.player1.discard.length).toBe(1);

                // CASE 4: Roger Roger is discard if there are no friendly Battle Droids in play

                context.player1.passAction();
                context.player2.clickCard(context.superlaserBlast);

                expect(rogerRoger).toBeInZone('discard');
                expect(context.player1.discard.length).toBe(2); // Droid Deployment & Roger Roger
            });
        });
    });
});
