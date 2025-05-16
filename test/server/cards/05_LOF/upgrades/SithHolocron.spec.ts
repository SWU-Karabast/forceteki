describe('Sith Holocron', function () {
    integration(function (contextRef) {
        it('Sith Holocron\'s should only be attached to Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sith-holocron'],
                    groundArena: ['karis#we-dont-like-strangers', 'wampa'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.sithHolocron);
            // Verify that only Karis (a Force unit) can be selected as a target
            expect(context.player1).toBeAbleToSelectExactly([context.karis]);
            context.player1.clickCard(context.karis);
        });

        it('Sith Holocron\'s ability can deal 2 damage to a friendly unit to give +2/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'karis#we-dont-like-strangers', upgrades: ['sith-holocron'] }],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });

            const { context } = contextRef;
            // Initiate attack with Karis
            context.player1.clickCard(context.karis);
            context.player1.clickCard(context.p2Base);

            // Verify that player can select friendly units for the Sith Holocron ability
            expect(context.player1).toBeAbleToSelectExactly([context.karis, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            // Verify damage calculation: 2 (Karis) + 1 (Sith Holocron) + 2 (Sith Holocron ability)
            expect(context.p2Base.damage).toBe(5); // 2+1+2

            context.player2.passAction();
            context.karis.exhausted = false;
            context.setDamage(context.p2Base, 0);

            // sith holocron bonus should be only for the current attack
            context.player1.clickCard(context.karis);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3); // 2+1
        });
    });
});
