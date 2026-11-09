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
