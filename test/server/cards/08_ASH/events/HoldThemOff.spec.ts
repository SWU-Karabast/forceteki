describe('Hold Them Off', function() {
    integration(function(contextRef) {
        describe('Hold Them Off\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['lurking-tie-phantom'],
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
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana, context.lurkingTiePhantom]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana, context.atst, context.hanSolo]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 1],
                    [context.atst, 1],
                    [context.wampa, 1],
                    [context.hanSolo, 1]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(1);
                expect(context.atst.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.firstOrderTieFighter).toHaveExactUpgradeNames(['shield']);
                expect(context.firstOrderTieFighter.damage).toBe(0);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.hanSolo.damage).toBe(1);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Hold Them Off to distribute 4 damage among units',
                    'player1 uses Hold Them Off to deal 1 damage to Battlefield Marine, 1 damage to AT-ST, 1 damage to Wampa, and 1 damage to Han Solo',
                ]);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.tielnFighter, context.firstOrderTieFighter]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 2]
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
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana, context.atst, context.hanSolo]);
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
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.battlefieldMarine]);
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

        describe('Hold Them Off\'s ability, with Jango Leader', function() {
            it('should do nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off'],
                        leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true }
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.jangoFett);
                context.player1.setDistributeDamagePromptState(new Map([[context.consularSecurityForce, 3]]));
                context.player1.clickPrompt('Trigger');

                expect(context.holdThemOff).toBeInZone('discard');
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.consularSecurityForce.exhausted).toBe(true);
            });
        });

        describe('Hold Them Off\'s ability, if played on Blue Leader in ground', function() {
            it('should not be able to hit space', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hold-them-off', 'blue-leader#scarif-air-support'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Pass');

                context.player2.passAction();

                context.player1.clickCard(context.holdThemOff);
                context.player1.clickCard(context.blueLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.blueLeader]);
                context.player1.setDistributeDamagePromptState(new Map([[context.consularSecurityForce, 5]]));
                expect(context.consularSecurityForce.damage).toBe(5);
            });
        });
    });
});