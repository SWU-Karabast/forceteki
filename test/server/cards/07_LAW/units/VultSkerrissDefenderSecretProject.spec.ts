describe('Vult Skerris, Defender Secret Project', function () {
    integration(function (contextRef) {
        describe('Vult Skerris\'s When Played ability', function () {
            it('should give a Shield when a card was discarded from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#unstoppable',
                        hand: ['vult-skerriss-defender#secret-project', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Attack to trigger Darth Vader's ability which lets us discard cards
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deal 1 damage to a unit or base');
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // Play Vult Skerris
                context.player1.clickCard(context.vultSkerrissDefender);

                // Should automatically get a Shield token
                expect(context.vultSkerrissDefender).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give a Shield when a card was discarded from hand last phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#unstoppable',
                        hand: ['vult-skerriss-defender#secret-project', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Attack to trigger Darth Vader's ability which lets us discard cards
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deal 1 damage to a unit or base');
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                // Play Vult Skerris
                context.player1.clickCard(context.vultSkerrissDefender);

                // Should automatically get a Shield token
                expect(context.vultSkerrissDefender).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give a Shield when a card was discarded from opponent\'s hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vult-skerriss-defender#secret-project', 'spark-of-rebellion']
                    },
                    player2: {
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sparkOfRebellion);
                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.vultSkerrissDefender);

                expect(context.vultSkerrissDefender).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a Shield when a card was discarded from deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vult-skerriss-defender#secret-project'],
                        deck: ['awing']
                    },
                    player2: {
                        groundArena: ['chopper#metal-menace'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.chopper);
                context.player2.clickCard(context.p1Base);

                expect(context.awing).toBeInZone('discard', context.player1);

                context.player1.clickCard(context.vultSkerrissDefender);
                // Should automatically get a Shield token
                expect(context.vultSkerrissDefender).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a Shield when opponent discards a card from own hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vult-skerriss-defender#secret-project', 'awing'],
                    },
                    player2: {
                        hand: ['spark-of-rebellion'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sparkOfRebellion);
                context.player2.clickCardInDisplayCardPrompt(context.awing);

                expect(context.awing).toBeInZone('discard', context.player1);

                context.player1.clickCard(context.vultSkerrissDefender);
                // Should automatically get a Shield token
                expect(context.vultSkerrissDefender).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give a Shield token if no card was discarded this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vult-skerriss-defender#secret-project']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vultSkerrissDefender);

                expect(context.vultSkerrissDefender.upgrades.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Vult Skerris\'s On Attack ability', function () {
            it('should deal 1 damage and exhaust a space unit on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vult-skerriss-defender#secret-project', 'awing'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer', 'alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vultSkerrissDefender);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.vultSkerrissDefender, context.awing, context.cartelSpacer, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.allianceXwing.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust a space unit even if it cannot take damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vult-skerriss-defender#secret-project'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vultSkerrissDefender);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.lurkingTiePhantom.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage to a unit that cannot be exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vult-skerriss-defender#secret-project'],
                    },
                    player2: {
                        hand: ['sneak-attack', 'leia-organa#extraordinary', 'kylo-rens-lightsaber'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sneakAttack);
                context.player2.clickCard(context.leiaOrgana);

                context.player1.passAction();

                context.player2.clickCard(context.kyloRensLightsaber);
                context.player2.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana.exhausted).toBeFalse();

                context.player1.clickCard(context.vultSkerrissDefender);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana.damage).toBe(1);
                expect(context.leiaOrgana.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
