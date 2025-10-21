describe('Umbaran Mobile Cannon', function () {
    integration(function (contextRef) {
        it('Umbaran Mobile Cannon\'s ability should prevent the first damage he should take each phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sneak-attack', 'ruthless-raider'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'umbaran-mobile-cannon', upgrades: ['entrenched'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sneakAttack);
            context.player1.clickCard(context.ruthlessRaider);
            context.player1.clickCard(context.umbaranMobileCannon);

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);

            context.player2.clickCard(context.umbaranMobileCannon);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(3);

            context.moveToRegroupPhase();

            context.player1.clickCard(context.umbaranMobileCannon);
            expect(context.umbaranMobileCannon.damage).toBe(3);

            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
        });

        it('Umbaran Mobile Cannon\'s ability should prevent the first damage he should take each phase (friendly damage)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['umbaran-mobile-cannon'],
                    leader: 'han-solo#worth-the-risk'
                },
                player2: {
                    groundArena: ['specforce-soldier']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
            context.player1.clickCard(context.umbaranMobileCannon);

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);

            context.player2.clickCard(context.specforceSoldier);
            context.player2.clickCard(context.umbaranMobileCannon);

            expect(context.player1).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(2);
        });

        it('Umbaran Mobile Cannon\'s ability should prevent the first damage he should take each phase (unpreventable damage)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'umbaran-mobile-cannon', upgrades: ['entrenched'] }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Deal indirect damage to opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.umbaranMobileCannon, 1],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(1);

            context.player2.clickCard(context.umbaranMobileCannon);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(4);
        });

        it('Umbaran Mobile Cannon\'s ability should prevent the first damage he should take each phase (choose prevent ability instead of shield)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'umbaran-mobile-cannon', upgrades: ['entrenched', 'shield'] }],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'specforce-soldier', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.umbaranMobileCannon);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHaveExactPromptButtons([
                'The first time this unit would take damage each phase, prevent that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player1.clickPrompt('The first time this unit would take damage each phase, prevent that damage');

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched', 'shield']);

            context.player2.clickCard(context.specforceSoldier);
            context.player2.clickCard(context.umbaranMobileCannon);

            expect(context.player1).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched']);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.umbaranMobileCannon);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched']);
        });

        it('Umbaran Mobile Cannon\'s ability should prevent the first damage he should take each phase (choose shield instead of prevent ability)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'umbaran-mobile-cannon', upgrades: ['entrenched', 'shield'] }],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'specforce-soldier', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.umbaranMobileCannon);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHaveExactPromptButtons([
                'The first time this unit would take damage each phase, prevent that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player1.clickPrompt('Defeat shield to prevent attached unit from taking damage');

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched']);

            context.player2.clickCard(context.specforceSoldier);
            context.player2.clickCard(context.umbaranMobileCannon);

            expect(context.player1).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched']);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.umbaranMobileCannon);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.umbaranMobileCannon.damage).toBe(0);
            expect(context.umbaranMobileCannon).toHaveExactUpgradeNames(['entrenched']);
        });
    });
});