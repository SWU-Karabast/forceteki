describe('The Armorer, Steel Shapes Us', function () {
    integration(function (contextRef) {
        describe('Leader side action ability', function () {
            it('plays an upgrade from resources on a unit that entered play this phase and resources the top card of the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['porg'],
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        groundArena: ['wampa'],
                        deck: ['moisture-farmer']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // play a unit so it enters play this phase
                context.player1.clickCard(context.porg);
                context.player2.passAction();

                context.player1.clickCard(context.theArmorer);
                expect(context.player1).toHaveEnabledPromptButton('Play an upgrade from your resources on a unit that entered play this phase');
                context.player1.clickPrompt('Play an upgrade from your resources on a unit that entered play this phase');

                // select upgrade from resources (only protector is an upgrade)
                expect(context.player1).toBeAbleToSelectExactly([context.protector]);
                context.player1.clickCard(context.protector);

                // only units that entered play this phase are valid attach targets
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                expect(context.player1).not.toBeAbleToSelect(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.theArmorer.exhausted).toBeTrue();
                expect(context.porg).toHaveExactUpgradeNames(['protector']);
                expect(context.moistureFarmer).toBeInZone('resource', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1.readyResourceCount).toBe(3);
            });

            it('allows attaching to any unit (friendly or enemy) that entered play this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['porg'],
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        deck: ['moisture-farmer']
                    },
                    player2: {
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                // player1 plays a unit
                context.player1.clickCard(context.porg);
                // player2 plays a unit
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.theArmorer);
                context.player1.clickCard(context.protector);

                // both units entered play this phase — both are valid attach targets
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.protector).toBeAttachedTo(context.wampa);
                expect(context.moistureFarmer).toBeInZone('resource', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1.readyResourceCount).toBe(1);
            });

            it('can play a unit with Piloting from resources as an upgrade on a vehicle that entered play this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['perimeter-atrt'],
                        // academy-graduate has Piloting [2 resources Vigilance]; perimeter-atrt costs 4
                        resources: ['academy-graduate', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        deck: ['moisture-farmer']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // play a vehicle so it enters play this phase
                context.player1.clickCard(context.perimeterAtrt);
                context.player2.passAction();

                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Play an upgrade from your resources on a unit that entered play this phase');

                // academy-graduate should appear as a selectable pilot (unit with Piloting, in resources)
                expect(context.player1).toBeAbleToSelectExactly([context.academyGraduate]);
                context.player1.clickCard(context.academyGraduate);

                // only the perimeter-atrt (a vehicle, entered play this phase) is a valid attach target
                expect(context.player1).toBeAbleToSelectExactly([context.perimeterAtrt]);
                context.player1.clickCard(context.perimeterAtrt);

                expect(context.perimeterAtrt).toHaveExactUpgradeNames(['academy-graduate']);
                expect(context.moistureFarmer).toBeInZone('resource', context.player1);
            });

            it('cannot target upgrades in hand or discard — only resources are valid sources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['protector', 'wampa'],
                        discard: ['entrenched'],
                        deck: ['moisture-farmer']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // play a unit so there is a valid attach target this phase
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                // ability has no legal targets — only underworld-thugs (units) are in resources
                context.player1.clickCard(context.theArmorer);
                expect(context.player1).toHaveEnabledPromptButton('(No effect) Play an upgrade from your resources on a unit that entered play this phase');
                context.player1.clickPrompt('(No effect) Play an upgrade from your resources on a unit that entered play this phase');
                context.player1.clickPrompt('Use it anyway');

                expect(context.theArmorer.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not let the player ramp when a targeted cost reduction makes the upgrade unaffordable on its only valid target', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['conveyex-security-captain'],
                        // Guardian of the Whills gives a cost reduction only when the upgrade is attached to itself,
                        // but it did not enter play this phase so it isn't a valid attach target for The Armorer
                        groundArena: ['guardian-of-the-whills'],
                        resources: ['durasteel-plating', 'dorsal-turret', 'atst', 'atst'],
                        base: 'data-vault',
                        deck: ['moisture-farmer']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // Conveyex Security Captain is the only unit to enter play this phase
                context.player1.clickCard(context.conveyexSecurityCaptain);
                context.player2.passAction();

                // Durasteel Plating (cost 2) can't be afforded on Conveyex Security Captain (only 1 ready resource,
                // and Guardian's reduction doesn't apply there), so the ability has no legal play — it's a soft pass
                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Use it anyway');

                // No upgrade is played and, crucially, no card is resourced from the deck (no ramp)
                expect(context.theArmorer.exhausted).toBeTrue();
                expect(context.durasteelPlating).toBeInZone('resource', context.player1);
                expect(context.conveyexSecurityCaptain).toHaveExactUpgradeNames([]);
                expect(context.moistureFarmer).toBeInZone('deck', context.player1);
                expect(context.player1.resources.length).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be activated as a soft pass if no units entered play this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        groundArena: ['wampa']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // no units played this phase — ability activates (has cost) but upgrade cannot attach
                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Use it anyway');

                // ability resolves with no effect — no upgrade selection prompt appears
                expect(context.theArmorer.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Leader unit side - When Attack Ends', function () {
            it('plays an upgrade from resources on any friendly unit and resources the top card of the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-armorer#steel-shapes-us', deployed: true },
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        groundArena: ['wampa'],
                        deck: ['moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // attack with The Armorer
                context.player1.clickCard(context.theArmorer);
                context.player1.clickCard(context.p2Base);

                // When Attack Ends triggers — select upgrade from resources
                expect(context.player1).toBeAbleToSelectExactly([context.protector]);
                context.player1.clickCard(context.protector);

                // friendly units only (not enemy battlefield-marine)
                expect(context.player1).toBeAbleToSelectExactly([context.theArmorer, context.wampa]);
                expect(context.player1).not.toBeAbleToSelect(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['protector']);
                expect(context.moistureFarmer).toBeInZone('resource', context.player1);
            });

            it('is optional — player may decline by passing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-armorer#steel-shapes-us', deployed: true },
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        groundArena: ['wampa'],
                        deck: ['moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theArmorer);
                context.player1.clickCard(context.p2Base);

                // pass on the optional ability
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.moistureFarmer).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('also allows The Armorer itself as an attach target', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-armorer#steel-shapes-us', deployed: true },
                        resources: ['protector', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                        deck: ['moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theArmorer);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.protector);
                expect(context.player1).toBeAbleToSelectExactly([context.theArmorer]);
                context.player1.clickCard(context.theArmorer);

                expect(context.theArmorer).toHaveExactUpgradeNames(['protector']);
                expect(context.moistureFarmer).toBeInZone('resource', context.player1);
            });
        });
    });
});
