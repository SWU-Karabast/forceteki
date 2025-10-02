describe('Warrior of Clan Ordo', function () {
    integration(function (contextRef) {
        it('Warrior of Clan Ordo\'s ability allows disclosing Aggression to avoid dealing 2 damage to your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['warrior-of-clan-ordo'],
                    hand: ['wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.warriorOfClanOrdo);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Disclose Aggression to not deal 2 damage to your base');
            context.player1.clickCard(context.wampa);

            // Opponent reviews the disclosed card(s)
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
            context.player2.clickDone();

            // Since we disclosed, our base should not take 2 damage from the ability
            expect(context.p1Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Warrior of Clan Ordo\'s ability deals 2 damage to your base if you decline to disclose', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['warrior-of-clan-ordo'],
                    hand: [
                        'wampa' // could disclose, but we will choose not to
                    ]
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.warriorOfClanOrdo);
            context.player1.clickCard(context.p2Base);

            // Prompt appears; choose to pass on disclose
            context.player1.clickPrompt('Choose nothing');

            expect(context.p1Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Warrior of Clan Ordo\'s ability automatically applies the 2 damage if you cannot disclose the required aspects (no prompt)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['warrior-of-clan-ordo'],
                    hand: ['salvage']
                },
                player2: {
                    hand: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.warriorOfClanOrdo);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Warrior of Clan Ordo\'s ability automatically applies the 2 damage if you do not have any card in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['warrior-of-clan-ordo'],
                },
                player2: {
                    hand: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.warriorOfClanOrdo);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
