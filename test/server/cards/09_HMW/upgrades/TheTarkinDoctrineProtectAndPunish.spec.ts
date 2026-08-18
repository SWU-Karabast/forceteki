describe('The Tarkin Doctrine, Protect and Punish', function() {
    integration(function(contextRef) {
        describe('The Tarkin Doctrine\'s When Played ability', function() {
            const attachToBasePrompt = 'Attach The Tarkin Doctrine to a base';
            const debuffEnemyUnitPrompt = 'Give an enemy unit -3/-0 for this phase';

            it('attaches to the controller\'s own base and, if they control Grand Moff Tarkin, gives an enemy unit -3/-0 for the phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish'],
                        groundArena: ['grand-moff-tarkin#death-star-overseer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTarkinDoctrine);

                // Fortify: the only legal attach target is the controller's own base
                expect(context.player1).toHavePrompt(attachToBasePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);

                // When Played: controls Grand Moff Tarkin, so choose an enemy unit to give -3/-0
                expect(context.player1).toHavePrompt(debuffEnemyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // The upgrade is attached and the enemy unit is debuffed for the phase
                expect(context.theTarkinDoctrine).toBeAttachedTo(context.p1Base);
                expect(context.wampa.getPower()).toBe(1);
                expect(context.player2).toBeActivePlayer();

                // The debuff expires at the end of the phase
                context.moveToNextActionPhase();
                expect(context.wampa.getPower()).toBe(4);
            });

            it('attaches to the controller\'s own base and, if they control an undeployed Grand Moff Tarkin leader, gives an enemy unit -3/-0 for the phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor' },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTarkinDoctrine);

                // Fortify: the only legal attach target is the controller's own base
                expect(context.player1).toHavePrompt(attachToBasePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);

                // controlsLeaderUnitOrUpgradeWithTitle matches the undeployed leader by title alone
                expect(context.player1).toHavePrompt(debuffEnemyUnitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // The upgrade is attached and the enemy unit is debuffed for the phase
                expect(context.theTarkinDoctrine).toBeAttachedTo(context.p1Base);
                expect(context.wampa.getPower()).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing on play if the controller does not control Grand Moff Tarkin', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to the base; with no Grand Moff Tarkin controlled,
                // the When Played ability offers no debuff target
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);

                expect(context.theTarkinDoctrine).toBeAttachedTo(context.p1Base);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Tarkin Doctrine\'s granted base ability', function() {
            it('lets the base exhaust an enemy unit when its controller plays a Fortification upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish', 'carbonite-chamber'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to the base (no Grand Moff Tarkin, so its When Played does nothing)
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);
                context.player2.passAction();

                // Carbonite Chamber has the Fortification trait, so playing it triggers the base's granted ability
                context.player1.clickCard(context.carboniteChamber);
                expect(context.player1).toHavePrompt('Attach Carbonite Chamber to a base');
                context.player1.clickCard(context.p1Base);

                // The granted ability triggers, prompting to exhaust an enemy unit
                expect(context.player1).toHavePrompt('Exhaust an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // Wampa is exhausted
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when its controller plays a non-Fortification upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish', 'resilient'],
                        groundArena: ['moisture-farmer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to the base
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);
                context.player2.passAction();

                // Resilient is a non-Fortification upgrade attached to a friendly unit, not the base
                context.player1.clickCard(context.resilient);
                context.player1.clickCard(context.moistureFarmer);

                // The granted base ability does not fire, so the enemy Wampa stays ready
                expect(context.resilient).toBeAttachedTo(context.moistureFarmer);
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when an opponent plays their own Fortification upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tarkin-doctrine#protect-and-punish'],
                    },
                    player2: {
                        hand: ['carbonite-chamber'],
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to player1's base
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);

                // player2 plays their own Fortification upgrade onto their own base
                context.player2.clickCard(context.carboniteChamber);
                context.player2.clickCard(context.p2Base);

                // player1's granted ability only cares about the base's own controller playing a Fortification upgrade.
                // If the guard were broken, this would have prompted player1 to exhaust player2's own Battlefield Marine
                // (the only enemy unit from player1's perspective).
                expect(context.carboniteChamber).toBeAttachedTo(context.p2Base);
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger if the base has lost all abilities to Galen Erso', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['the-tarkin-doctrine#protect-and-punish', 'carbonite-chamber'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['galen-erso#youll-never-win'],
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to player1's base
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);

                // player2 names player1's base with Galen Erso, blanking it
                context.player2.clickCard(context.galenErso);
                expect(context.player2).toHaveExactDropdownListOptions(context.getAllNonLeaderCardTitles());
                expect(context.getAllNonLeaderCardTitles()).toContain('Kestro City');
                context.player2.chooseListOption('Kestro City');

                // The base's granted ability (from The Tarkin Doctrine) is lost, so playing a Fortification upgrade does nothing
                context.player1.clickCard(context.carboniteChamber);
                context.player1.clickCard(context.p1Base);

                // Wampa stays ready
                expect(context.carboniteChamber).toBeAttachedTo(context.p1Base);
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
