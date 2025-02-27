describe('Fett\'s Firespray, Feared Silhouette', function () {
    integration(function (contextRef) {
        it('Fett\'s Firespray\'s ability should deal 1 indirect damage to opponent when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    leader: 'rio-durant#wisecracking-wheelman'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 1],
            ]));
            expect(context.p2Base.damage).toBe(1);
        });

        it('Fett\'s Firespray\'s ability should deal 2 indirect damage to opponent when played as we control Boba1 as leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    leader: 'boba-fett#collecting-the-bounty'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));
            expect(context.p2Base.damage).toBe(2);
        });

        it('Fett\'s Firespray\'s ability should deal 2 indirect damage to opponent when played as we control Boba2 as leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    leader: 'boba-fett#daimyo'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));
            expect(context.p2Base.damage).toBe(2);
        });

        it('Fett\'s Firespray\'s ability should deal 2 indirect damage to opponent when played as we control Boba4 as leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    leader: 'boba-fett#any-methods-necessary'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));
            expect(context.p2Base.damage).toBe(2);
        });

        it('Fett\'s Firespray\'s ability should deal 2 indirect damage to opponent when played as we control Boba1 as unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#feared-silhouette'],
                    groundArena: ['boba-fett#disintegrator'],
                    leader: 'rio-durant#wisecracking-wheelman'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));
            expect(context.p2Base.damage).toBe(2);
        });

        it('Fett\'s Firespray\'s ability should deal 2 indirect damage to opponent on attack as we control Boba1 as leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['fetts-firespray#feared-silhouette'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 2],
            ]));
            expect(context.p2Base.damage).toBe(6); // 4+2
        });

        it('Fett\'s Firespray\'s ability should deal 1 indirect damage to opponent on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['fetts-firespray#feared-silhouette'],
                    leader: 'rio-durant#wisecracking-wheelman'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 1],
            ]));
            expect(context.p2Base.damage).toBe(5); // 4+1
        });

        // TODO WHEN PILOTING IS DONE, TEST WITH BOBA AS UPGRADE
    });
});
