describe('Commander Gree, Of the 41st Elite Corps', function() {
    integration(function(contextRef) {
        it('Commander Gree\'s constant ability should give him Raid 4 if there are 3 or more Command aspect icons among friendly units and upgrades with fortify', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sinister-war-memorial'],
                    groundArena: ['commander-gree#of-the-41st-elite-corps', 'battlefield-marine'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sinisterWarMemorial);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.commanderGree);
            context.player1.clickCard(context.p2Base);

            // 3 plus raid 4
            expect(context.p2Base.damage).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('Commander Gree\'s constant ability should give him Raid 4 if there are 3 or more Command aspect icons among friendly units and upgrades without fortify', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['commander-gree#of-the-41st-elite-corps', { card: 'battlefield-marine', upgrades: ['generals-blade'] }],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.commanderGree);
            context.player1.clickCard(context.p2Base);

            // 3 plus raid 4
            expect(context.p2Base.damage).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('Commander Gree\'s constant ability should not give Raid to other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sinister-war-memorial'],
                    groundArena: ['commander-gree#of-the-41st-elite-corps', 'battlefield-marine'],
                    base: 'chopper-base'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sinisterWarMemorial);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Commander Gree\'s constant ability should not give him Raid if the opponent meets the requirements', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['commander-gree#of-the-41st-elite-corps'],
                    base: 'chopper-base'
                },
                player2: {
                    groundArena: ['battlefield-marine', 'vanguard-infantry', 'steadfast-battalion']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.commanderGree);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});