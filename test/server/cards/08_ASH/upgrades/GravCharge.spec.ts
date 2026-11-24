describe('Grav Charge', function() {
    integration(function(contextRef) {
        it('Grav Charge\'s ability should deal 4 damage to attached unit and defeat itself when attack ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['grav-charge'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.gravCharge).toBeInZone('discard');
        });

        it('Grav Charge\'s ability should deal damage to attached unit\'s shield and defeat itself when attack ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield', 'grav-charge'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.gravCharge).toBeInZone('discard');
        });

        // The attached unit is defeated in combat, so Grav Charge is in the discard pile when the attack ends, and its trigger waits beside the unit's When Defeated
        // trigger. The prompt that orders them reads each trigger's title, and Grav Charge's title read the parentCard getter, which asserts that the upgrade is
        // attached ("Contract assertion failure: Null-like object value: null"). It names the attached unit as its plain title does now (as Shield's title does).
        it('Grav Charge\'s title does not throw when the attached unit was defeated in the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'yoda#trickster-in-exile', upgrades: ['grav-charge'] }],
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.wampa);

            expect(context.yoda).toBeInZone('discard');
            expect(context.gravCharge).toBeInZone('discard');
            expect(context.player1).toHaveExactPromptButtons(['Put Yoda on top of your deck', 'Deal 4 damage to attached unit and defeat this upgrade']);
            context.player1.clickPrompt('Deal 4 damage to attached unit and defeat this upgrade');

            expect(context.player1).toHavePassAbilityPrompt('Put Yoda on top of your deck');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.p1Base);

            expect(context.yoda).toBeInZone('deck');
            expect(context.p1Base.damage).toBe(3);
            expect(context.wampa.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
