describe('Green Leader, Crynyd\'s Sacrifice', function () {
    integration(function (contextRef) {
        it('Green Leader\'s ability should allow dealing 2 damage to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-leader#crynyds-sacrifice'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['atst'],
                    spaceArena: ['tie-bomber'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.greenLeader);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieBomber]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
        });

        it('Green Leader\'s ability should allow dealing 2 damage to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-leader#crynyds-sacrifice'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['atst'],
                    spaceArena: ['tie-bomber'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.greenLeader);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.tieBomber]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
        });

        it('Green Leader\'s ability should trigger for its controller when defeated in combat while an opponent-controlled Grav Charge is attached', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [
                        {
                            card: 'green-leader#crynyds-sacrifice',
                            upgrades: [{ card: 'grav-charge', ownerAndController: 'player2' }]
                        }
                    ]
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }],
                    spaceArena: ['mynock']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.greenLeader);
            context.player1.clickCard(context.mynock);

            expect(context.greenLeader).toBeInZone('discard', context.player1);
            expect(context.mynock).toBeInZone('discard', context.player2);
            expect(context.gravCharge).toBeInZone('discard', context.player2);

            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.player1).toHavePrompt('Deal 2 damage to a unit');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
