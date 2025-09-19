
describe('Kylo Ren, We\'re Not Done Yet', function () {
    integration(function(contextRef) {
        describe('Kylo Ren\'s leader side ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        deck: ['fifth-brother#fear-hunter'],
                        hand: [
                            'fallen-lightsaber',
                            'force-throw',
                            'drain-essence',
                            'inferno-four#unforgetting',
                            'iden-versio#adapt-or-die',
                        ]
                    },
                });
            });

            it('discards a card from hand. If an upgrade is chosen, it also draws a card.', function () {
                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                context.player1.clickCard(context.fallenLightsaber);

                // Verify the card was discarded and a new card was drawn
                expect(context.fallenLightsaber).toBeInZone('discard');
                expect(context.fifthBrother).toBeInZone('hand');
                expect(context.kyloRen.exhausted).toBeTrue();
            });

            it('does not draw a card if an event is chosen', function () {
                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                context.player1.clickCard(context.forceThrow);

                // Verify the card was discarded but no new card was drawn
                expect(context.forceThrow).toBeInZone('discard');
                expect(context.fifthBrother).toBeInZone('deck');
                expect(context.kyloRen.exhausted).toBeTrue();
            });

            it('does not draw a card if a piloting unit is chosen', function () {
                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                context.player1.clickCard(context.idenVersio);

                // Verify the card was discarded but no new card was drawn
                expect(context.idenVersio).toBeInZone('discard');
                expect(context.fifthBrother).toBeInZone('deck');
                expect(context.kyloRen.exhausted).toBeTrue();
            });

            it('can be cancelled before a card is discarded', function () {
                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');

                // Verify the player can cancel
                expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');
                context.player1.clickPrompt('Cancel');

                // Ability was not used, it is still Player 1's action
                expect(context.kyloRen.exhausted).toBeFalse();
                expect(context.player1.hand.length).toBe(5);
                expect(context.player1.discard.length).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Kylo Ren\'s leader side edge cases', function() {
            it('does nothing if no cards are in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [],
                        deck: ['fifth-brother#fear-hunter'],
                        leader: 'kylo-ren#were-not-done-yet'
                    }
                });

                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                expect(context.player1).toHaveNoEffectAbilityPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                context.player1.clickPrompt('Use it anyway');

                // No cards should be discarded or drawn, it is now Player 2's action
                expect(context.player2).toBeActivePlayer();
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.fifthBrother).toBeInZone('deck');
                expect(context.player1.discard.length).toBe(0);
            });

            it('lets the player discard an upgrade even if there are no more cards to draw', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fallen-lightsaber'],
                        deck: [],
                        leader: 'kylo-ren#were-not-done-yet'
                    }
                });

                const { context } = contextRef;

                // Use Kylo Ren's ability
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Discard a card from your hand. If you discard an Upgrade this way, draw a card');
                context.player1.clickCard(context.fallenLightsaber);

                // Verify the card was discarded and base took damage for drawing from an empty deck
                expect(context.fallenLightsaber).toBeInZone('discard');
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.p1Base.damage).toBe(3);
                expect(context.getChatLogs(1)).toContain('player1 attempts to draw 1 cards from their empty deck and takes 3 damage instead');
            });
        });

        describe('Kylo Ren\'s unit side ability', function() {
            it('when deployed, allows playing any number of Upgrades on Kylo Ren from the discard pile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        spaceArena: [
                            'inferno-four#unforgetting'
                        ],
                        groundArena: [
                            'doctor-pershing#experimenting-with-life'
                        ],
                        discard: [
                            'fallen-lightsaber',
                            'constructed-lightsaber',
                            'devotion',
                            'drain-essence',
                            'iden-versio#adapt-or-die',
                            'dorsal-turret'
                        ]
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                // Verify playable Upgrades from discard
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fallenLightsaber,
                    context.constructedLightsaber,
                    context.devotion,
                ]);

                // Verify non-playable cards are not selectable
                expect(context.player1).toBeAbleToSelectNoneOf([
                    context.idenVersio,   // Cannot select piloting unit
                    context.drainEssence, // Cannot select event
                    context.dorsalTurret  // Cannot select Upgrade that can't attach to Kylo Ren
                ]);

                // Verify we could choose nothing
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                // Choose Fallen Lightsaber
                context.player1.clickCard(context.fallenLightsaber);
                expect(context.player1).toHavePrompt('Attach Fallen Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber'
                ]);

                // Choose Constructed Lightsaber
                context.player1.clickCard(context.constructedLightsaber);
                expect(context.player1).toHavePrompt('Attach Constructed Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'constructed-lightsaber'
                ]);

                // Choose Devotion
                context.player1.clickCard(context.devotion);
                expect(context.player1).toHavePrompt('Attach Devotion to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'constructed-lightsaber',
                    'devotion'
                ]);

                expect(context.player2).toBeActivePlayer();
            });

            it('when deployed, resolves upgrade triggers as they are played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        spaceArena: [
                            'inferno-four#unforgetting'
                        ],
                        groundArena: [
                            'doctor-pershing#experimenting-with-life'
                        ],
                        discard: [
                            'craving-power',
                            'fallen-lightsaber',
                            'snapshot-reflexes'
                        ]
                    },
                    player2: {
                        spaceArena: ['devastator#inescapable']
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                // Verify playable Upgrades from discard
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fallenLightsaber,
                    context.cravingPower,
                    context.snapshotReflexes
                ]);

                // Verify we could choose nothing
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                // Choose Craving Power
                context.player1.clickCard(context.cravingPower);
                expect(context.player1).toHavePrompt('Attach Craving Power to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'craving-power'
                ]);

                expect(context.player1).toHavePrompt('Deal damage to an enemy unit equal to attached unit\'s power');
                expect(context.player1).toBeAbleToSelectExactly([context.devastator]);
                context.player1.clickCard(context.devastator);
                expect(context.devastator.damage).toBe(7);

                // Choose Fallen Lightsaber
                context.player1.clickCard(context.fallenLightsaber);
                expect(context.player1).toHavePrompt('Attach Fallen Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'craving-power'
                ]);

                // Choose Snapshot Reflexes
                context.player1.clickCard(context.snapshotReflexes);
                expect(context.player1).toHavePrompt('Attach Snapshot Reflexes to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(13);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'craving-power',
                    'snapshot-reflexes'
                ]);

                expect(context.player1).toHavePassAbilityPrompt('Attack with attached unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('only allows playing upgrades that can be paid for', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        discard: [
                            'fallen-lightsaber',
                            'constructed-lightsaber',
                            'devotion',
                        ],
                        resources: {
                            readyCount: 3,
                            exhaustedCount: 4
                        }
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                // Verify playable Upgrades from discard
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fallenLightsaber,
                    context.constructedLightsaber,
                    context.devotion
                ]);

                // Choose Fallen Lightsaber
                context.player1.clickCard(context.fallenLightsaber);
                expect(context.player1).toHavePrompt('Attach Fallen Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);

                // Cost was paid and upgrade was attached
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber'
                ]);

                // No more ready resources, P1's turn ends
                expect(context.player2).toBeActivePlayer();
            });

            it('when deployed, does nothing if cost of upgrades in discard cannot be paid', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        spaceArena: [
                            'inferno-four#unforgetting'
                        ],
                        groundArena: [
                            'doctor-pershing#experimenting-with-life'
                        ],
                        discard: [
                            'fallen-lightsaber',
                            'constructed-lightsaber',
                            'devotion',
                            'drain-essence',
                            'iden-versio#adapt-or-die',
                            'dorsal-turret'
                        ],
                        resources: {
                            readyCount: 1,
                            exhaustedCount: 6
                        }
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to choose no Upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        discard: [
                            'fallen-lightsaber',
                            'constructed-lightsaber',
                            'devotion',
                        ],
                        resources: {
                            readyCount: 3,
                            exhaustedCount: 4
                        }
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                // Verify playable Upgrades from discard
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fallenLightsaber,
                    context.constructedLightsaber,
                    context.devotion
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                // Choose nothing
                context.player1.clickPrompt('Pass');

                // P1's turn ends without attaching any upgrades
                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.kyloRen).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if no Upgrades are in discard pile that can attach to Kylo Ren', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#were-not-done-yet',
                        base: 'fortress-vader',
                        spaceArena: [
                            'inferno-four#unforgetting'
                        ],
                        groundArena: [
                            'doctor-pershing#experimenting-with-life'
                        ],
                        discard: [
                            'drain-essence',
                            'iden-versio#adapt-or-die',
                            'dorsal-turret'
                        ]
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});