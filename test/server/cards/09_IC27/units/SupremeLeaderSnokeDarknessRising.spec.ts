describe('Supreme Leader Snoke, Darkness Rising', function () {
    integration(function (contextRef) {
        it('Snoke\'s when played ability should deal 4 damage to each other unit and draw a card for each friendly unit defeated this way', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['death-trooper', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            // 4 damage dealt to each other unit
            expect(context.supremeLeaderSnoke.damage).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.awing).toBeInZone('discard');
            expect(context.wampa.damage).toBe(4);
            expect(context.deathTrooper).toBeInZone('discard');
            expect(context.atst.damage).toBe(4);

            // Draw a card for each friendly unit defeated this way (Battlefield Marine + A-Wing)
            expect(context.player1.hand.length).toBe(2);
            expect(context.player2.hand.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Snoke\'s when played ability should not draw cards for enemy units defeated this way', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.wampa.damage).toBe(4);

            // No friendly unit was defeated, no card is drawn
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Snoke\'s when played ability should not count a shielded unit as defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }, 'wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            // Shield is defeated instead of Battlefield Marine
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.wampa.damage).toBe(4);
            expect(context.awing).toBeInZone('discard');
            expect(context.atst.damage).toBe(4);

            // Only A-Wing was defeated this way, draw 1 card
            expect(context.player1.hand.length).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Snoke\'s when played ability should not draw a card when Queen Amidala prevents her damage by defeating another friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: ['queen-amidala#championing-her-people', 'royal-guard-attache'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            // Queen Amidala's damage prevention triggers when Snoke's damage is dealt to her
            expect(context.player1).toHavePassAbilityPrompt('Defeat a friendly unit that shares a trait with Queen Amidala to prevent all damage to her');
            context.player1.clickPrompt('Trigger');
            // Both Royal Guard Attaché and Snoke share the Official trait with Queen Amidala
            expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache, context.supremeLeaderSnoke]);
            context.player1.clickCard(context.royalGuardAttache);

            // Amidala takes no damage and Royal Guard Attache was defeated by her ability, not by Snoke's damage
            expect(context.queenAmidala.damage).toBe(0);
            expect(context.royalGuardAttache).toBeInZone('discard');
            expect(context.wampa.damage).toBe(4);

            // No friendly unit was defeated by Snoke's damage, no card is drawn
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
