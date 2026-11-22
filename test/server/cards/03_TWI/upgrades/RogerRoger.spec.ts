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
        });

        it('should attach to the new controller\'s Battle Droid when defeated after being stolen with Evidence of the Crime', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        'battle-droid',
                        { card: 'super-battle-droid', upgrades: ['roger-roger'] },
                    ]
                },
                player2: {
                    hand: ['evidence-of-the-crime', 'confiscate'],
                    groundArena: ['battle-droid', 'wampa'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const p1BattleDroid = context.player1.findCardByName('battle-droid');
            const p2BattleDroid = context.player2.findCardByName('battle-droid');
            const rogerRoger = context.player1.findCardByName('roger-roger');

            // Player 2 steals Roger Roger and attaches it to their own Wampa
            context.player2.clickCard(context.evidenceOfTheCrime);
            context.player2.clickCard(rogerRoger);
            context.player2.clickCard(context.wampa);

            expect(rogerRoger.controller).toBe(context.player2Object);
            expect(context.wampa).toHaveExactUpgradeNames(['roger-roger']);

            context.player1.passAction();

            // Defeat the stolen Roger Roger: player 2 now controls its When Defeated ability,
            // so it can only attach to player 2's Battle Droid
            context.player2.clickCard(context.confiscate);
            context.player2.clickCard(rogerRoger);

            expect(context.player2).toBeAbleToSelectExactly([p2BattleDroid]);
            context.player2.clickCard(p2BattleDroid);

            expect(p2BattleDroid).toHaveExactUpgradeNames(['roger-roger']);
            expect(p1BattleDroid).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });

        it('should stay with its controller\'s Battle Droid when the attached unit is defeated with No Glory, Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        'battle-droid',
                        { card: 'super-battle-droid', upgrades: ['roger-roger'] },
                    ]
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battle-droid'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const p1BattleDroid = context.player1.findCardByName('battle-droid');
            const p2BattleDroid = context.player2.findCardByName('battle-droid');
            const rogerRoger = context.player1.findCardByName('roger-roger');

            // Player 2 takes control of the Super Battle Droid and defeats it. Roger Roger stays
            // under player 1's control, so player 1 resolves its When Defeated ability
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.superBattleDroid);

            expect(context.superBattleDroid).toBeInZone('discard', context.player1);
            expect(context.player1).toBeAbleToSelectExactly([p1BattleDroid]);
            context.player1.clickCard(p1BattleDroid);

            expect(p1BattleDroid).toHaveExactUpgradeNames(['roger-roger']);
            expect(p2BattleDroid).toHaveExactUpgradeNames([]);
            expect(rogerRoger.controller).toBe(context.player1Object);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
