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

        it('Snoke\'s when played ability should count a friendly unit as defeated when Ty Yorrick increases the damage to lethal', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: ['ty-yorrick#monster-hunter', 'wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            // Ty Yorrick's optional damage increase applies when the ability is initiated
            expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
            context.player1.clickPrompt('Trigger');

            // 5 damage dealt to each other unit, defeating both 5 HP friendly units
            expect(context.supremeLeaderSnoke.damage).toBe(0);
            expect(context.tyYorrickMonsterHunter).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.atst.damage).toBe(5);

            // Without the increase Wampa would have survived at 4 damage; both friendly defeats count, draw 2 cards
            expect(context.player1.hand.length).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Snoke\'s when played ability should not count a friendly unit as defeated when Vigil reduces the damage below lethal', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supreme-leader-snoke#darkness-rising'],
                    groundArena: [{ card: 'wampa', damage: 1 }],
                    spaceArena: ['vigil#securing-the-future'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremeLeaderSnoke);

            // Vigil's two damage modification abilities trigger on the damage dealt to Wampa and Vigil
            expect(context.player1).toHaveExactPromptButtons([
                'Reduce all damage dealt to friendly non-Vigil units by 1',
                'Increase all damage dealt to Vigil by another card by 1'
            ]);
            context.player1.clickPrompt('Reduce all damage dealt to friendly non-Vigil units by 1');

            // Vigil prevents 1 of the damage to Wampa (4 remaining HP), so it survives at 4 damage.
            // Damage dealt to Vigil itself is increased to 5 by its other ability.
            expect(context.wampa.damage).toBe(4);
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.vigil.damage).toBe(5);
            expect(context.vigil).toBeInZone('spaceArena');

            // No friendly unit was defeated this way, no card is drawn
            expect(context.player1.hand.length).toBe(0);
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
