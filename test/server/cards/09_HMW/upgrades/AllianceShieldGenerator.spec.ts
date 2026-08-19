describe('Alliance Shield Generator', function() {
    integration(function(contextRef) {
        it('Alliance Shield Generator\'s ability should prevent all damage, defeat itself, and draw a card when the attached base would be dealt exactly 5 damage in one instance', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    deck: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['strike-team-vanguard'],
                }
            });

            const { context } = contextRef;

            // Strike Team Vanguard (5 power) attacks the base for exactly 5 damage in one instance
            context.player2.clickCard(context.strikeTeamVanguard);
            context.player2.clickCard(context.p1Base);

            // The damage is fully prevented, so the "if you do" defeat and draw both resolve
            expect(context.p1Base.damage).toBe(0);
            expect(context.allianceShieldGenerator).toBeInZone('discard');
            expect(context.wampa).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain(
                'player1 uses Alliance Shield Generator to defeat Alliance Shield Generator and draw a card and to  instead of their base taking damage'
            );
        });

        it('Alliance Shield Generator\'s ability should deal damage normally and not trigger prevention when a single instance deals less than 5 damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['massassi-group-marines'],
                }
            });

            const { context } = contextRef;

            // Massassi Group Marines (4 power) attacks the base for 4 damage, below the threshold
            context.player2.clickCard(context.massassiGroupMarines);
            context.player2.clickCard(context.p1Base);

            // The damage resolves normally: no prevention, no defeat, no draw
            expect(context.p1Base.damage).toBe(4);
            expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
            expect(context.player1.hand.length).toBe(0);
        });

        it('Alliance Shield Generator\'s ability should prevent all damage from a large single instance, proving prevention is not capped at 5', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    deck: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    spaceArena: ['mercenary-fleet'],
                }
            });

            const { context } = contextRef;

            // Mercenary Fleet (10 power) attacks the base for 10 damage in one instance
            context.player2.clickCard(context.mercenaryFleet);
            context.player2.clickCard(context.p1Base);

            // All 10 damage is prevented, showing prevention isn't capped at exactly 5
            expect(context.p1Base.damage).toBe(0);
            expect(context.allianceShieldGenerator).toBeInZone('discard');
            expect(context.wampa).toBeInZone('hand');
        });

        it('Alliance Shield Generator\'s ability should not prevent indirect damage of 5 or more, since indirect damage is unpreventable', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    hand: ['torpedo-barrage'],
                    deck: ['wampa'],
                }
            });

            const { context } = contextRef;

            // Torpedo Barrage deals 5 indirect damage, and player1 assigns it all to their own base
            context.player1.clickCard(context.torpedoBarrage);
            context.player1.clickPrompt('Deal indirect damage to yourself');

            // Indirect damage is unpreventable, so the ability never triggers: the base takes the
            // full 5 damage, the upgrade isn't defeated, and no card is drawn
            expect(context.p1Base.damage).toBe(5);
            expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
            expect(context.wampa).toBeInZone('deck');
            expect(context.player1.hand.length).toBe(0);
        });

        it('Alliance Shield Generator\'s ability should prevent Overwhelm excess damage of 5 or more, defeat itself, draw a card, and still let the defending unit take its full combat damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    groundArena: ['battlefield-marine'],
                    deck: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['sontuul-berserkers'],
                }
            });

            const { context } = contextRef;

            // Son-tuul Berserkers (8 power, Overwhelm) attacks Battlefield Marine (3 HP)
            context.player2.clickCard(context.sontuulBerserkers);
            context.player2.clickCard(context.battlefieldMarine);

            // Overwhelm sends the 5 excess damage to the base after defeating Battlefield Marine,
            // and that excess damage is fully prevented
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(0);
            expect(context.allianceShieldGenerator).toBeInZone('discard');
            expect(context.wampa).toBeInZone('hand');
        });

        it('Alliance Shield Generator\'s ability should prevent direct Overwhelm damage when the defending unit is defeated before combat damage, sending all combat damage to the base as excess', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    groundArena: ['death-star-stormtrooper'],
                    deck: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: [{ card: 'emperor-palpatine#master-of-the-dark-side', upgrades: ['fallen-lightsaber'] }],
                }
            });

            const { context } = contextRef;

            // Emperor Palpatine (9 power with Fallen Lightsaber, Overwhelm) attacks Death Star Stormtrooper, defeating it before combat damage
            context.player2.clickCard(context.emperorPalpatine);
            context.player2.clickCard(context.deathStarStormtrooper);

            expect(context.deathStarStormtrooper).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(0);
            expect(context.allianceShieldGenerator).toBeInZone('discard');
            expect(context.wampa).toBeInZone('hand');
        });

        it('Alliance Shield Generator\'s ability should deal Overwhelm excess damage below 5 to the base normally, without triggering prevention', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    groundArena: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['sontuul-berserkers'],
                }
            });

            const { context } = contextRef;

            // Son-tuul Berserkers (8 power, Overwhelm) attacks Wampa (5 HP)
            context.player2.clickCard(context.sontuulBerserkers);
            context.player2.clickCard(context.wampa);

            // Overwhelm sends the 3 excess damage to the base after defeating Wampa; that's below
            // the 5-damage threshold, so it isn't prevented
            expect(context.wampa).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(3);
            expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
        });

        it('Alliance Shield Generator\'s ability should not trigger prevention when a single attack deals two separate sub-5 instances that together total 5 or more', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                },
                player2: {
                    hasInitiative: true,
                    spaceArena: [{ card: 'yellow-aces-bomber', upgrades: ['experience'] }],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.yellowAcesBomber);
            context.player2.clickCard(context.p1Base); // Attack target
            context.player2.clickCard(context.p1Base); // Damage ping target

            expect(context.p1Base.damage).toBe(5);
            expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
        });

        it('Alliance Shield Generator\'s ability should still defeat itself when prevention fires with an empty deck, dealing 3 damage from the failed draw instead of drawing a card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    deck: [],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['strike-team-vanguard'],
                }
            });

            const { context } = contextRef;

            // Strike Team Vanguard (5 power) attacks the base for exactly 5 damage
            context.player2.clickCard(context.strikeTeamVanguard);
            context.player2.clickCard(context.p1Base);

            // The 5-damage instance is fully prevented, but the "if you do" draw fails against an
            // empty deck and deals 3 damage to player1's own base instead
            expect(context.allianceShieldGenerator).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(3);
        });
    });
});
