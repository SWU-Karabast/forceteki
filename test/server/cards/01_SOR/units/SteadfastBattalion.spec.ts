describe('Steadfast Battalion', function () {
    integration(function (contextRef) {
        describe('Steadfast Battalion\'s On Attack ability', function () {
            it('should give a unit +2/+2 if you control a leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Attack with Steadfast Battalion
                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.p2Base);

                // Ability should trigger
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.steadfastBattalion, context.chirrutImwe]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(5);

                context.player2.passAction();

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                // steadfast battalion: 5 + battlefieldMarine: 3+2 = 10
                expect(context.p2Base.damage).toBe(10);
            });

            it('should not give a unit +2/+2 if you do not control a leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.p2Base);

                // Ability doesn't trigger, it is now P2's turn
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // Attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                // steadfast battalion: 5 + battlefieldMarine: 3 = 8
                expect(context.p2Base.damage).toBe(8);
            });

            it('works when you control a pilot leader upgrade that makes attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['n1-starfighter'],
                        groundArena: ['steadfast-battalion']
                    }
                });

                const { context } = contextRef;

                // Deploy Kazuda Xiono as a pilot on N-1 Starfighter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player1.clickCard(context.n1Starfighter);
                context.player2.passAction();

                // Now attack with Steadfast Battalion
                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.p2Base);

                // Ability triggers & can target all friendly units
                expect(context.player1).toHavePrompt('Give a friendly unit +2/+2 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.steadfastBattalion, context.n1Starfighter]);

                // Choose steadfast battalion
                context.player1.clickCard(context.steadfastBattalion);
                expect(context.p2Base.damage).toBe(7);
            });

            it('does not work when you control a pilot leader upgrade that does not make attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['steadfast-battalion']
                    }
                });

                const { context } = contextRef;

                // Attach Poe as a pilot on Green Squadron A-Wing
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();

                // Now attack with Steadfast Battalion
                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.p2Base);

                // No ability to resolve, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
