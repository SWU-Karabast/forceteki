describe('Leia Organa, Get To Your Transports', function () {
    integration(function (contextRef) {
        it('Leia Organa\'s leader side ability should heal 1 damage from a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#get-to-your-transports',
                    groundArena: [{ card: 'wampa', damage: 2 }],
                    spaceArena: [{ card: 'green-squadron-awing', damage: 1 }]
                },
                player2: {
                    groundArena: [{ card: 'cloud-city-wing-guard', damage: 1 }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            context.player1.clickPrompt('Heal 1 damage from a friendly unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(1);
            expect(context.leiaOrganaGetToYourTransports.exhausted).toBe(true);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Leia Organa\'s leader unit side ability should heal 1 damage from 2 friendly units when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'leia-organa#get-to-your-transports', deployed: true },
                    groundArena: [{ card: 'wampa', damage: 2 }, { card: 'battlefield-marine', damage: 1 }],
                },
                player2: {
                    groundArena: ['atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);
            expect(context.player1).not.toHavePrompt('Done');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
        });

        it('Leia Organa\'s leader unit side ability should heal 1 damage from 1 friendly unit when only 1 is available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'leia-organa#get-to-your-transports', deployed: true, damage: 2 },
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrganaGetToYourTransports);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana]);
            context.player1.clickCard(context.leiaOrgana);

            expect(context.player2).toBeActivePlayer();
            expect(context.leiaOrgana.damage).toBe(1);
        });
    });
});