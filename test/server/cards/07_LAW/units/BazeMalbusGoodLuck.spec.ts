describe('Baze Malbus, Good Luck', function () {
    integration(function (contextRef) {
        it('should deal damage to a unit when damage is healed from him by a leader ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'obiwan-kenobi#patient-mentor',
                    groundArena: [{ card: 'baze-malbus#good-luck', damage: 5 }],
                    spaceArena: ['green-squadron-awing'],
                    resources: 3
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.bazeMalbus);
            expect(context.player1).toBeAbleToSelectExactly([context.bazeMalbus, context.greenSquadronAwing, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.bazeMalbus.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(1);
        });

        it('should deal damage to a unit when damage is healed from him by a unit ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'baze-malbus#good-luck', damage: 5 }, 'grogu#mysterious-child'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grogu);
            context.player1.clickPrompt('Heal up to 2 damage from a unit. If you do, deal that much damage to a unit');
            context.player1.clickCard(context.bazeMalbus);

            expect(context.player1).toBeAbleToSelectExactly([context.bazeMalbus, context.greenSquadronAwing, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.bazeMalbus, context.greenSquadronAwing, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.bazeMalbus.damage).toBe(1);
            expect(context.wampa.damage).toBe(4);
        });

        it('should deal damage to a unit when damage is healed from him by an event card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair'],
                    groundArena: [{ card: 'baze-malbus#good-luck', damage: 5 }],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.bazeMalbus);

            expect(context.player1).toBeAbleToSelectExactly([context.bazeMalbus, context.greenSquadronAwing, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.bazeMalbus.damage).toBe(2);
            expect(context.wampa.damage).toBe(3);
        });
    });
});
