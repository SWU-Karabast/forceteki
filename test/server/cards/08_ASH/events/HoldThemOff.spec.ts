describe('Hold Them Off', function() {
    integration(function(contextRef) {
        describe('Hold Them Off\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter', { card: 'first-order-tie-fighter', upgrades: ['shield'] }],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    },
                });
            });

            it('should allow a friendly unit to distribute its power as damage across other units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 1],
                    [context.firstOrderTieFighter, 1],
                    [context.tielnFighter, 1],
                    [context.hanSolo, 1]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.firstOrderTieFighter).toHaveExactUpgradeNames([]);
                expect(context.firstOrderTieFighter.damage).toBe(0);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.hanSolo.damage).toBe(1);

                expect(context.getChatLogs(4)).toEqual([
                    'player1 plays Hold Them Off to distribute 4 damage among units',
                    'player1 uses Hold Them Off to deal 1 damage to Battlefield Marine, 1 damage to First Order TIE Fighter, 1 damage to TIE/ln Fighter, and 1 damage to Han Solo',
                    'player2 uses Shield to defeat Shield instead of First Order TIE Fighter taking damage',
                    'player2\'s TIE/ln Fighter is defeated by player1 due to having no remaining HP'
                ]);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 4]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.hanSolo.damage).toBe(0);
            });

            it('should be able to choose 0 targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.hanSolo.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Hold Them Off\'s ability, if there is only one target for damage,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    },
                });
            });

            it('should not automatically select that target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.setDistributeDamagePromptState(new Map([]));
            });
        });

        describe('Hold Them Off\'s ability, if there are no friendly units', function() {
            it('should do nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off'],
                        groundArena: []
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickPrompt('Play anyway');

                expect(context.holdThemOff).toBeInZone('discard');
                expect(context.consularSecurityForce.damage).toBe(0);
            });
        });
    });
});