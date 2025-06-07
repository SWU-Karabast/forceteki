
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

                // No cards should be discarded or drawn
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

                // Verify the card was discarded and no new card was drawn
                expect(context.fallenLightsaber).toBeInZone('discard');
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
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
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

                // Choose all 3 playable Upgrades
                context.player1.clickCard(context.fallenLightsaber);
                context.player1.clickCard(context.constructedLightsaber);
                context.player1.clickCard(context.devotion);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Play each Upgrade on Kylo Ren, one at a time, paying their costs
                expect(context.player1).toHavePrompt('Attach Fallen Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber'
                ]);

                expect(context.player1).toHavePrompt('Attach Constructed Lightsaber to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'constructed-lightsaber'
                ]);

                expect(context.player1).toHavePrompt('Attach Devotion to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
                context.player1.clickCard(context.kyloRen);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.kyloRen).toHaveExactUpgradeNames([
                    'fallen-lightsaber',
                    'constructed-lightsaber',
                    'devotion'
                ]);

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