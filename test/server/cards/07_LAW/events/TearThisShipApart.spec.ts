describe('Tear This Ship Apart', function() {
    integration(function(contextRef) {
        describe('Tear This Ship Apart\'s ability', function() {
            it('should look at opponent\'s resources and allow playing one for free', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                    },
                    player2: {
                        deck: ['awing', 'yoda#old-master'],
                        resources: ['wampa', 'battlefield-marine', 'atst', 'confidence-in-victory']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.battlefieldMarine, context.atst],
                    invalid: [context.confidenceInVictory],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Select a card to play for free
                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(0);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.awing).toBeInZone('resource', context.player2);
            });

            it('should look at opponent\'s resources and can choose nothing to play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                    },
                    player2: {
                        deck: ['awing'],
                        resources: ['wampa', 'battlefield-marine', 'atst', 'confidence-in-victory']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.battlefieldMarine, context.atst],
                    invalid: [context.confidenceInVictory],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.wampa).toBeInZone('resource', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);
            });

            it('should work when opponent has no resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                    },
                    player2: {
                        resources: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);
                expect(context.player1).toHavePrompt('Playing Tear This Ship Apart will have no effect. Are you sure you want to play it?');
                context.player1.clickPrompt('Play anyway');

                // Should complete immediately since no resources to look at
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2.resources.length).toBe(0);
            });

            it('should look at opponent\'s resources and allow playing one for free (event with conditions)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                        resources: 10
                    },
                    player2: {
                        deck: ['awing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'one-in-a-million', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);

                context.player1.clickCardInDisplayCardPrompt(context.oneInAMillion);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.oneInAMillion).toBeInZone('discard', context.player2);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.awing).toBeInZone('resource', context.player2);
            });

            it('should look at opponent\'s resources and allow playing one for free (Piloting unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        resources: ['han-solo#has-his-moments']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);

                context.player1.clickCardInDisplayCardPrompt(context.hanSolo);
                context.player1.clickPrompt('Play Han Solo with Piloting');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['han-solo#has-his-moments']);
            });

            it('should look at opponent\'s resources, allow playing one for free and opponent resource the top card of his deck (nested action discard the top card of opponent deck)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tear-this-ship-apart'],
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                        resources: ['devastator#inescapable', 'deceptive-shade', 'kanan-jarrus#revealed-jedi', 'wampa', 'atst', 'wampa', 'atst']
                    },
                    player2: {
                        deck: ['awing', 'yoda#old-master'],
                        groundArena: ['battlefield-marine'],
                        resources: ['endless-legions']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tearThisShipApart);

                context.player1.clickCardInDisplayCardPrompt(context.endlessLegions);

                context.player1.clickCard(context.deceptiveShade);
                context.player1.clickCard(context.devastator);
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickDone();

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.deceptiveShade, context.devastator, context.kananJarrus]);
                context.player2.clickDone();

                context.player1.clickCard(context.deceptiveShade);
                context.player1.clickCard(context.devastator);
                context.player1.clickCard(context.deceptiveShade);
                // devastator killed deceptive shade, the next unit will have ambush
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);
                // make opponent discard the top card of his deck
                context.player1.clickPrompt('Trigger');

                // TODO follow clarifications for the order of resolving nested and if you do
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(context.yoda).toBeInZone('resource', context.player2);
                // expect(context.awing).toBeInZone('resource', context.player2);
                // expect(context.yoda).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should play upgrades that have friendly unit restrictions on friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#crime-boss',
                        base: 'echo-base',
                        hand: ['tear-this-ship-apart'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        deck: ['awing', 'confiscate'],
                        groundArena: ['battlefield-marine'],
                        resources: ['craving-power']
                    }
                });

                const { context } = contextRef;

                // Play Tear This Ship Apart and select Craving Power
                context.player1.clickCard(context.tearThisShipApart);
                context.player1.clickCardInDisplayCardPrompt(context.cravingPower);

                // Craving Power can only be played on friendly units
                expect(context.player1).toHavePrompt('Attach Craving Power to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['craving-power']);

                // Resolve its When Played ability to deal damage to Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.awing).toBeInZone('resource', context.player2);
                expect(context.confiscate).toBeInZone('deck', context.player2);
            });

            // Ruling 2026-05-06: "playing" the selected event means putting it into its owner's discard
            // pile and resolving its ability, which must complete BEFORE the text after "If you do" (the
            // opponent resourcing the top card of their deck). So if the selected card is itself a Tear
            // This Ship Apart, it resolves fully against the resources available at that moment and does
            // NOT have access to the card the opponent resources afterward.
            // See the related TODO at ~line 191 ("follow clarifications for the order of resolving
            // nested and if you do") with its commented-out expectations.
            xit('finishes playing the selected card before the "If you do" resources the top card (recursive Tear This Ship Apart)', function () {
                // Player 1 plays Tear This Ship Apart and chooses to play a second Tear This Ship Apart
                // from the opponent's resources. That second Tear This Ship Apart resolves fully (looking
                // only at the resources present at that moment) before the first one's "If you do" causes
                // the opponent to resource the top card of their deck — so the newly-resourced card is
                // not available to the second Tear This Ship Apart.
            });
        });
    });
});
