describe('Queen Amidala, Championing Her People', function() {
    integration(function(contextRef) {
        describe('Queen Amidala, Championing Her People\'s ability', function() {
            it('should create 2 Spy tokens when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['queen-amidala#championing-her-people'],
                        groundArena: ['royal-guard-attache']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.queenAmidalaChampioningHerPeople);

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(2);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent attacking combat damage if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.queenAmidalaChampioningHerPeople);
                context.player1.clickCard(context.wampa);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.wampa).toBeInZone('discard');
                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should prevent defending combat damage if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                expect(context.player1).toHavePassAbilityPrompt('Defeat a friendly unit that shares a trait with Queen Amidala to prevent all damage to her');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.wampa).toBeInZone('discard');
                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should prevent event damage if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should not prevent indirect damage if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                expect(context.player1).toBeAbleToSelectExactly([context.queenAmidalaChampioningHerPeople, context.p1Base, context.royalGuardAttache]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 4],
                    [context.queenAmidalaChampioningHerPeople, 1],
                ]));

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(1);
            });

            it('should prevent event damage if the player chooses to defeat a friendly ground unit that shares a trait when the trait is granted to Amidala', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'clan-wren-rescuer', { card: 'queen-amidala#championing-her-people', upgrades: ['foundling'] }]
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer]);
                context.player1.clickCard(context.clanWrenRescuer);

                expect(context.clanWrenRescuer).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should be able to be passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Pass');

                expect(context.royalGuardAttache).toBeInZone('groundArena');
                expect(context.queenAmidalaChampioningHerPeople).toBeInZone('discard');
            });

            it('should not trigger if there are no units to defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.queenAmidalaChampioningHerPeople).toBeInZone('discard');
            });

            it('should prevent damage from friendly source if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people']
                    },
                    player2: {
                        hand: ['torpedo-barrage'],
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should prevent damage just to Amidala from Maul if the player chooses to defeat a friendly ground unit that shares a trait', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['royal-guard-attache', 'queen-amidala#championing-her-people', 'consular-security-force']
                    },
                    player2: {
                        hand: ['open-fire', 'torpedo-barrage'],
                        groundArena: ['wampa', 'darth-maul#revenge-at-last'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.darthMaulRevengeAtLast);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickPrompt('Done');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.royalGuardAttache]);
                context.player1.clickCard(context.royalGuardAttache);

                expect(context.darthMaulRevengeAtLast).toBeInZone('discard');
                expect(context.royalGuardAttache).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(5);
            });

            it('should act correctly with when defeated triggers and when combat damage dealt ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: [{ card: 'queen-amidala#championing-her-people', upgrades: ['perilous-position'] }],
                        spaceArena: ['jtype-nubian-starship']
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'phaseiii-dark-trooper', upgrades: ['electrostaff'] }],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.phaseiiiDarkTrooper);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.jtypeNubianStarship]);
                context.player1.clickCard(context.jtypeNubianStarship);

                context.player2.clickPrompt('Opponent');

                context.player1.clickCard(context.openFire);

                expect(context.phaseiiiDarkTrooper.damage).toBe(3);
                expect(context.phaseiiiDarkTrooper).toHaveExactUpgradeNames(['electrostaff', 'experience']);
                expect(context.jtypeNubianStarship).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });

            it('should act correctly with when defeated triggers and other when defeated triggers', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire', 'power-of-the-dark-side'],
                        groundArena: ['queen-amidala#championing-her-people'],
                        spaceArena: ['jtype-nubian-starship']
                    },
                    player2: {
                        spaceArena: [{ card: 'ruthless-raider', upgrades: ['grim-valor'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                context.player2.clickCard(context.ruthlessRaider);
                context.player2.clickPrompt('Deal 2 damage to an enemy base and 2 damage to an enemy unit');
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.jtypeNubianStarship]);
                context.player1.clickCard(context.jtypeNubianStarship);

                context.player1.clickCard(context.openFire);

                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);

                expect(context.jtypeNubianStarship).toBeInZone('discard');
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
                expect(context.queenAmidalaChampioningHerPeople.exhausted).toBe(true);
            });

            it('should act correctly with when defeated triggers and other when defeated triggers', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire', 'power-of-the-dark-side'],
                        groundArena: ['queen-amidala#championing-her-people', 'jar-jar-binks#mesa-propose'],
                    },
                    player2: {
                        hand: ['saesee-tiin#courageous-warrior'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.saeseeTiinCourageousWarrior);
                context.player2.clickCard(context.queenAmidalaChampioningHerPeople);
                context.player2.clickCard(context.jarJarBinksMesaPropose);
                context.player2.clickPrompt('Done');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.jarJarBinksMesaPropose]);
                context.player1.clickCard(context.jarJarBinksMesaPropose);

                expect(context.jarJarBinksMesaPropose).toBeInZone('discard');
                expect(context.queenAmidalaChampioningHerPeople.damage).toBe(0);
            });
        });
    });
});