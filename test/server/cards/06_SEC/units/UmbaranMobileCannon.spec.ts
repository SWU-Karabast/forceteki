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

        it('Umbaran Mobile Cannon\'s ability cannot prevent unpreventable damage (and next damage are taken)', async function () {
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
                'Defeat Shield to prevent Umbaran Mobile Cannon from taking damage'
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
                'Defeat Shield to prevent Umbaran Mobile Cannon from taking damage'
            ]);
            context.player1.clickPrompt('Defeat Shield to prevent Umbaran Mobile Cannon from taking damage');

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

        // Ruling 2026-02-10: damage being prevented by ANOTHER replacement effect does not change
        // whether it is the "first" or "next" time the Cannon would take damage. If the Cannon's first
        // damage this phase is prevented by a different replacement (e.g. Vigil, or a Shield), the
        // Cannon's own "first time would take damage" is still considered to have occurred — so a later
        // hit this phase is the "second time" and is NOT prevented by the Cannon's ability.
        // NOTE: possible engine/ruling mismatch — the existing "(choose shield instead of prevent
        // ability)" test above prevents the first damage with a Shield and then shows a second hit still
        // leaving the Cannon at 0 damage, which suggests the Cannon's "first time" is NOT being consumed
        // by the other replacement. This documents the intended behavior.
        xit('has its "first time would take damage" consumed even when another replacement (Vigil) prevents that first damage', function () {
            // Umbaran Mobile Cannon and a source of Vigil's "prevent 1 damage to another friendly unit"
            // replacement are in play. The Cannon would take its first damage this phase; the player uses
            // Vigil's replacement to prevent it instead of the Cannon's own. The Cannon's "first time"
            // is still consumed, so a later hit this phase is the second time and is dealt to the Cannon.
        });
    });
});