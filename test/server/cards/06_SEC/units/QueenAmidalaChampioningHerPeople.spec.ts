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
        });
    });
});