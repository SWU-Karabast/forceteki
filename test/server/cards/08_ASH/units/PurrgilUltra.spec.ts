describe('Purrgil Ultra', function() {
    integration(function(contextRef) {
        it('should bounce a friendly unit and deal damage to an enemy unit equal to its cost to enemy unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['purrgil-ultra'],
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the cost of Wampa (4 damage)');
            expect(context.player1).toBeAbleToSelectExactly([context.purrgilUltra, context.phoenixSquadronAwing, context.atst, context.greenSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(4);
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('should bounce a friendly unit and deal damage equal to its cost to friendly unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['purrgil-ultra'],
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the cost of Phoenix Squadron A-Wing (2 damage)');
            expect(context.player1).toBeAbleToSelectExactly([context.purrgilUltra, context.greenSquadronAwing, context.atst, context.wampa, context.grandInquisitor]);
            context.player1.clickCard(context.grandInquisitor);

            expect(context.player2).toBeActivePlayer();
            expect(context.grandInquisitor.damage).toBe(2);
            expect(context.phoenixSquadronAwing).toBeInZone('hand', context.player1);
        });

        it('should be able to be passed when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['purrgil-ultra'],
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.grandInquisitor.damage).toBe(0);
            expect(context.phoenixSquadronAwing).toBeInZone('spaceArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
        });

        xit('should work with clone when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['purrgil-ultra', 'clone'],
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    resources: 100
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing, context.clone]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.clone);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the cost of Clone (4 damage)');
            expect(context.player1).toBeAbleToSelectExactly([context.purrgilUltra, context.phoenixSquadronAwing, context.atst, context.greenSquadronAwing, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(4);
            expect(context.clone).toBeInZone('hand', context.player1);
        });

        it('should bounce a friendly unit and deal damage to an enemy unit equal to its cost to enemy unit when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing', 'purrgil-ultra']
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the cost of Wampa (4 damage)');
            expect(context.player1).toBeAbleToSelectExactly([context.phoenixSquadronAwing, context.atst, context.greenSquadronAwing]);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.damage).toBe(4);
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('should bounce a friendly unit and deal damage equal to its cost to friendly unit when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing', 'purrgil-ultra'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the cost of Phoenix Squadron A-Wing (2 damage)');
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.atst, context.wampa, context.grandInquisitor]);
            context.player1.clickCard(context.grandInquisitor);

            expect(context.player1).toBeActivePlayer();
            expect(context.grandInquisitor.damage).toBe(2);
            expect(context.phoenixSquadronAwing).toBeInZone('hand', context.player1);
        });

        it('should be able to be passed when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing', 'purrgil-ultra']
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.purrgilUltra);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player1).toBeActivePlayer();
            expect(context.phoenixSquadronAwing).toBeInZone('spaceArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
        });

        it('should work with NGOR', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['phoenix-squadron-awing', 'purrgil-ultra'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.purrgilUltra);


            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing]);
            expect(context.player2).toHavePassAbilityButton();
            context.player2.clickCard(context.greenSquadronAwing);

            expect(context.player2).toHavePrompt('Deal damage to a unit equal to the cost of Green Squadron A-Wing (2 damage)');
            expect(context.player2).toBeAbleToSelectExactly([context.phoenixSquadronAwing, context.atst, context.wampa, context.grandInquisitor]);
            context.player2.clickCard(context.grandInquisitor);

            expect(context.player1).toBeActivePlayer();
            expect(context.grandInquisitor.damage).toBe(2);
            expect(context.greenSquadronAwing).toBeInZone('hand', context.player2);
        });
    });
});