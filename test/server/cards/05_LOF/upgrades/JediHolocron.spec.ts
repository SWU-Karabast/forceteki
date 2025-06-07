describe('Jedi Holocron', function () {
    integration(function (contextRef) {
        it('Jedi Holocron\'s should only be attached to Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-holocron'],
                    groundArena: ['karis#we-dont-like-strangers', 'wampa'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.jediHolocron);
            // Verify that only Karis (a Force unit) can be selected as a target
            expect(context.player1).toBeAbleToSelectExactly([context.karis]);
            context.player1.clickCard(context.karis);
        });

        it('Jedi Holocrons\'s ability to heal 3 damage from another unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'karis#we-dont-like-strangers', upgrades: ['jedi-holocron'] }],
                    spaceArena: [{ card: 'green-squadron-awing', damage: 2 }],
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }],
                }
            });

            const { context } = contextRef;
            // Initiate attack with Karis
            context.player1.clickCard(context.karis);
            context.player1.clickCard(context.p2Base);

            // Scenario 1 - Jedi Holocron heals friendly green squadron a wing
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(0);
            expect(context.p2Base.damage).toBe(3);

            context.player2.passAction();
            context.karis.exhausted = false;
            context.setDamage(context.p2Base, 0);

            // Scenario 2 - Jedi Holocron heals opponents wampa
            context.player1.clickCard(context.karis);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
