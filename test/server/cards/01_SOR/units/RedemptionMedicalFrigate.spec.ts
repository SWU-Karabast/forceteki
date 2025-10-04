describe('Redemption Medical Frigate', function() {
    integration(function(contextRef) {
        it('Redemption\'s ability can heal up to 8 damages from units and base and deal damage to itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['redemption#medical-frigate', 'the-emperors-legion'],
                    groundArena: [{ card: 'yoda#old-master', damage: 2 }, { card: 'battlefield-marine', damage: 0 }],
                    spaceArena: [{ card: 'alliance-xwing', damage: 1 }],
                    leader: { card: 'han-solo#worth-the-risk', deployed: true, damage: 4 },
                    base: { card: 'dagobah-swamp', damage: 5 },
                    resources: 50
                },
                player2: {
                    hand: ['waylay', 'cantina-bouncer', 'vanquish'],
                    groundArena: [{ card: 'atst', damage: 3 }],
                    spaceArena: [{ card: 'tieln-fighter', damage: 0 }],
                    base: { card: 'administrators-tower', damage: 10 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.redemption);

            // select card to give healing
            expect(context.player1).toBeAbleToSelectExactly([
                context.redemption,
                context.yoda,
                context.hanSolo,
                context.allianceXwing,
                context.battlefieldMarine,
                context.atst,
                context.p1Base,
                context.p2Base,
                context.tielnFighter
            ]);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.yoda, 2], // We can heal all damages
                [context.hanSolo, 1], // We can heal the leader unit
                [context.allianceXwing, 1], // We can heal the space unit
                [context.p1Base, 1], // We can heal controller's base
                [context.p2Base, 2], // We can heal opponent's base
                [context.atst, 1] // We can heal opponent's unit
            ]));
            expect(context.yoda.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.hanSolo.damage).toBe(3);
            expect(context.allianceXwing.damage).toBe(0);
            expect(context.p1Base.damage).toBe(4);
            expect(context.p2Base.damage).toBe(8);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.atst.damage).toBe(2);

            expect(context.redemption.damage).toBe(8);
            expect(context.getChatLogs(2)).toEqual([
                'player1 uses Redemption to distribute 2 healing to Yoda, 1 healing to Han Solo, 1 healing to Alliance X-Wing, 1 healing to their own base, 2 healing to player2\'s base, and 1 healing to AT-ST',
                'player1 uses Redemption to deal 8 damage to Redemption',
            ]);

            // Reset Redemption with Waylay
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.redemption);

            // We can heal less than 8 damages
            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.hanSolo, 4], // We try to heal more than the leader's damage
                [context.battlefieldMarine, 1], // We over heal undamaged unit
                [context.p1Base, 2],
            ]));

            expect(context.hanSolo.damage).toBe(0);
            expect(context.p1Base.damage).toBe(2);

            expect(context.redemption.damage).toBe(5);
            expect(context.getChatLogs(2)).toEqual([
                'player1 uses Redemption to distribute 3 healing to Han Solo and 2 healing to their own base',
                'player1 uses Redemption to deal 5 damage to Redemption',
            ]);

            // Reset Redemption with Cantina Bouncer
            context.player2.clickCard(context.cantinaBouncer);
            context.player2.clickCard(context.redemption);
            expect(context.redemption).toBeInZone('hand');
            expect(context.player1).toBeActivePlayer();

            // We can heal 0 damage
            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([]));

            expect(context.atst.damage).toBe(2);
            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(8);

            expect(context.redemption.damage).toBe(0);

            // Last Redemption reset with Vanquish + The Emperor's Legion
            // We try to heal 8 after playing with Han Solo's ability: 2 damages
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.redemption);
            expect(context.redemption).toBeInZone('discard');
            expect(context.player1).toBeActivePlayer();

            context.player1.clickCard(context.theEmperorsLegion);
            expect(context.redemption).toBeInZone('hand');
            context.player2.passAction();
            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.p2Base, 8],
            ]));
            expect(context.p2Base.damage).toBe(0);
            expect(context.redemption).toBeInZone('discard');
        });
    });
});
