describe('Execute Order 66\'s ability', function () {
    integration(function (contextRef) {
        it('should give 6 damage to each Jedi unit and create a clone trooper token if defeated this way', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['execute-order-66'],
                    groundArena: ['obiwan-kenobi#following-fate', 'battlefield-marine'],
                    spaceArena: ['padawan-starfighter'],
                },
                player2: {
                    groundArena: ['luke-skywalker#jedi-knight'],
                    spaceArena: ['mining-guild-tie-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.executeOrder66);
            expect(context.obiwanKenobi).toBeInZone('discard');
            expect(context.padawanStarfighter).toBeInZone('discard');
            expect(context.lukeSkywalker.damage).toBe(6);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.miningGuildTieFighter.damage).toBe(0);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers.every((trooper) => trooper.exhausted)).toBe(true);
            context.player1.clickCard(cloneTroopers[0]); // We resolve Obi-Wan when defeated

            expect(context.player2).toBeActivePlayer();
        });

        it('should create the clone trooper even in the opponent side', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['execute-order-66'],
                    groundArena: ['aayla-secura#master-of-the-blade', 'battlefield-marine'],
                    spaceArena: ['padawan-starfighter'],
                },
                player2: {
                    groundArena: ['obiwan-kenobi#following-fate'],
                    spaceArena: ['mining-guild-tie-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.executeOrder66);
            expect(context.obiwanKenobi).toBeInZone('discard');
            expect(context.padawanStarfighter).toBeInZone('discard');
            expect(context.aaylaSecura).toBeInZone('discard');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.miningGuildTieFighter.damage).toBe(0);
            // Player clone trooper
            const playerCloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(playerCloneTroopers.length).toBe(2);
            expect(playerCloneTroopers.every((trooper) => trooper.exhausted)).toBe(true);

            // Opponent clone troopers
            const opponentCloneTroopers = context.player2.findCardsByName('clone-trooper');
            expect(opponentCloneTroopers.length).toBe(1);
            expect(opponentCloneTroopers[0].exhausted).toBe(true);
            context.player2.clickCard(opponentCloneTroopers[0]);
        });

        it('should do nothing if there no Jedi unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['execute-order-66'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['mining-guild-tie-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.executeOrder66);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.miningGuildTieFighter).toBeInZone('spaceArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
