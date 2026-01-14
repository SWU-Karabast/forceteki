describe('C-3PO, Translation Protocol', function () {
    integration(function (contextRef) {
        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    groundArena: ['c3po#translation-protocol', { card: 'wampa', upgrades: ['fulcrum'] }, 'populist-advisor', 'mythosaur#folklore-awakened', 'atst'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.populistAdvisor, context.greenSquadronAwing, context.mythosaur, context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader (some trait added with upgrade)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, upgrades: ['fulcrum'] },
                    groundArena: ['c3po#translation-protocol', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader (some trait are lost)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    groundArena: ['c3po#translation-protocol', 'yoda#old-master'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['nameless-terror'],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.namelessTerror);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            // yoda is not selectable because luke lost his force trait
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });
    });
});
