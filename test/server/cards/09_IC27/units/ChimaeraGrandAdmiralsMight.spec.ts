describe('Chimaera, Grand Admiral\'s Might', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            it('gives an Experience token to each friendly unit for each upgrade on it, then heals 1 damage per friendly upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'tarkintown', damage: 10 },
                        hand: ['chimaera#grand-admirals-might'],
                        groundArena: [
                            { card: 'wampa', upgrades: ['experience', 'shield'] },
                            { card: 'battlefield-marine', upgrades: ['academy-training'] },
                            { card: 'atst' }
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'death-star-stormtrooper', upgrades: ['experience'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                // Resolve Shielded first so Chimaera's Shield token counts as an upgrade for its own When Played
                context.player1.clickPrompt('Shielded');

                // Each friendly unit gets Experience equal to the number of upgrades on it
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['academy-training', 'experience']);
                expect(context.atst.upgrades.length).toBe(0);

                // Chimaera's Shield token from Shielded counts as an upgrade, so it gets 1 Experience
                expect(context.chimaera).toHaveExactUpgradeNames(['shield', 'experience']);

                // Enemy units with upgrades are unaffected
                expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['experience']);

                // The log calls out the per-unit amounts
                expect(context.getChatLogs(6)).toContain('player1 uses Chimaera to give 2 Experience tokens to Wampa, an Experience token to Battlefield Marine, and an Experience token to Chimaera');

                // Heal counts friendly upgrades after the tokens were granted: 4 (wampa) + 2 (marine) + 2 (chimaera) = 8
                expect(context.p1Base.damage).toBe(2);
            });

            it('gives itself an Experience token for its Shield token and heals for both upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'tarkintown', damage: 5 },
                        hand: ['chimaera#grand-admirals-might']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                // Resolve Shielded first so the Shield counts as an upgrade for the When Played
                context.player1.clickPrompt('Shielded');

                expect(context.chimaera).toHaveExactUpgradeNames(['shield', 'experience']);

                // Shield + newly granted Experience = 2 friendly upgrades
                expect(context.p1Base.damage).toBe(3);
            });

            it('counts a Fortify upgrade on the base for the heal without granting Experience for it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'tarkintown', damage: 10, upgrades: ['alliance-shield-generator'] },
                        hand: ['chimaera#grand-admirals-might'],
                        groundArena: [
                            { card: 'wampa', upgrades: ['experience', 'shield'] }
                        ]
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                // Resolve Shielded first so Chimaera's Shield token counts as an upgrade for its own When Played
                context.player1.clickPrompt('Shielded');

                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'shield', 'experience', 'experience']);
                expect(context.chimaera).toHaveExactUpgradeNames(['shield', 'experience']);
                expect(context.p1Base).toHaveExactUpgradeNames(['alliance-shield-generator']);

                // Heal counts all friendly upgrades in play, including the Fortify upgrade on the base:
                // 4 (wampa) + 2 (chimaera) + 1 (alliance-shield-generator) = 7
                expect(context.p1Base.damage).toBe(3);
            });

            it('doubles each unit\'s token count individually when Moff Jerjerrod replaces the token creation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'tarkintown', damage: 20 },
                        hand: ['chimaera#grand-admirals-might'],
                        groundArena: [
                            'moff-jerjerrod#we-shall-redouble-our-efforts',
                            { card: 'wampa', upgrades: ['experience', 'shield'] },
                            { card: 'battlefield-marine', upgrades: ['academy-training'] }
                        ]
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickPrompt('Shielded');

                // Jerjerrod first prompts on the Shielded token creation — decline it
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Shield tokens instead');
                context.player1.clickPrompt('Pass');

                // The Experience creation event carries 2 + 1 + 1 = 4 tokens; doubling creates 8 total
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 8 Experience tokens instead');
                context.player1.clickPrompt('Trigger');

                // Each unit gets twice its own amount (4/2/2), not the doubled total (8) each
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'shield', 'experience', 'experience', 'experience', 'experience']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['academy-training', 'experience', 'experience']);
                expect(context.chimaera).toHaveExactUpgradeNames(['shield', 'experience', 'experience']);

                // Heal counts friendly upgrades after doubling: 6 (wampa) + 3 (marine) + 3 (chimaera) = 12
                expect(context.p1Base.damage).toBe(8);

                // The log calls out the original per-unit amounts and the doubled replacement
                expect(context.getChatLogs(8)).toEqual(jasmine.arrayContaining([
                    'player1 uses Chimaera to give 2 Experience tokens to Wampa, an Experience token to Battlefield Marine, and an Experience token to Chimaera',
                    'player1 uses Moff Jerjerrod to defeat Moff Jerjerrod',
                    'player1 uses Moff Jerjerrod to create 8 Experience tokens instead',
                ]));
            });

            it('does not give itself an Experience if the When Played resolves before Shielded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'tarkintown', damage: 5 },
                        hand: ['chimaera#grand-admirals-might']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                // Resolve the When Played first — Chimaera has no upgrades yet, so it gets no Experience
                context.player1.clickPrompt('Give an Experience token to each friendly unit for each upgrade on it');

                expect(context.chimaera).toHaveExactUpgradeNames(['shield']);

                // The heal also resolves before Shielded attaches — no friendly upgrades yet, so nothing is healed
                expect(context.p1Base.damage).toBe(5);
            });
        });
    });
});
