describe('Overwhelming Barrage', function() {
    integration(function(contextRef) {
        describe('Overwhelming Barrage\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter', { card: 'first-order-tie-fighter', upgrades: ['shield'] }],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give a friendly unit +2/+2 for the phase and allow it to distribute its power as damage across other units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.atst, 2],
                    [context.battlefieldMarine, 1],
                    [context.firstOrderTieFighter, 1],
                    [context.tielnFighter, 1],
                    [context.hanSolo, 1]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.firstOrderTieFighter).toHaveExactUpgradeNames([]);
                expect(context.firstOrderTieFighter.damage).toBe(0);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.hanSolo.damage).toBe(1);

                expect(context.getChatLogs(4)).toContain('player1 plays Overwhelming Barrage to give +2/+2 to Wampa for this phase');
                expect(context.getChatLogs(3)).toContain('player2 uses Shield to prevent First Order TIE Fighter from taking damage');
                expect(context.getChatLogs(2)).toContain('player1 uses Overwhelming Barrage to deal 2 damage to AT-ST, 1 damage to Battlefield Marine, 1 damage to TIE/ln Fighter, and 1 damage to Han Solo');
                expect(context.getChatLogs(1)).toContain('player2\'s TIE/ln Fighter is defeated by player1 due to having no remaining HP');

                // attack into wampa to confirm stats buff
                context.setDamage(context.atst, 0);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.damage).toBe(6);
                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.damage).toBe(6);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 6]
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

                context.player1.clickCard(context.overwhelmingBarrage);
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

                // attack into wampa to confirm stats buff
                context.setDamage(context.atst, 0);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.damage).toBe(6);
                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.damage).toBe(6);
            });
        });

        describe('Overwhelming Barrage\'s ability, if there is only one target for damage,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not automatically select that target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.setDistributeDamagePromptState(new Map([]));
            });
        });
    });
});
