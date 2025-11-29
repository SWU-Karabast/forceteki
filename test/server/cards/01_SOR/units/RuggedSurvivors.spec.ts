describe('Rugged Survivors', function () {
    integration(function (contextRef) {
        describe('Rugged Survivors\'s On Attack ability', function () {
            it('should draw if you control a deployed leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card if you control a leader unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not draw if you do not control a deployed leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2.hand.length).toBe(0);
            });

            it('works when you control a pilot leader upgrade that makes attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['n1-starfighter'],
                        groundArena: ['rugged-survivors'],
                        deck: ['resupply']
                    }
                });

                const { context } = contextRef;

                // Deploy Kazuda Xiono as a pilot on N-1 Starfighter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player1.clickCard(context.n1Starfighter);
                context.player2.passAction();

                // Now attack with Rugged Survivors
                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);

                // Ability triggers & draws Resupply
                expect(context.player1).toHavePassAbilityPrompt('Draw a card if you control a leader unit');
                context.player1.clickPrompt('Trigger');
                expect(context.resupply).toBeInZone('hand', context.player1);
            });

            it('does not work when you control a pilot leader upgrade that does not make attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['rugged-survivors'],
                        deck: ['resupply']
                    }
                });

                const { context } = contextRef;

                // Attach Poe as a pilot on Green Squadron A-Wing
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();

                // Now attack with Rugged Survivors
                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);

                // No ability to resolve, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
                expect(context.resupply).toBeInZone('deck', context.player1);
            });
        });
    });
});
