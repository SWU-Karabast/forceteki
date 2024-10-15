describe('Overwhelming Barrage', function() {
    integration(function(contextRef) {
        describe('Overwhelming Barrage\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    }
                });
            });

            it('should give a friendly unit +2/+2 for the phase and allow it to distribute its power as damage across other units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.leiaOrgana]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.atst, 2],
                    [context.battlefieldMarine, 2],
                    [context.tielnFighter, 1],
                    [context.hanSolo, 1]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.tielnFighter).toBeInLocation('discard');
                expect(context.hanSolo.damage).toBe(1);

                // attack into wampa to confirm stats buff
                context.setDamage(context.atst, 0);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInLocation('ground arena');
                expect(context.wampa.damage).toBe(6);
                expect(context.atst).toBeInLocation('ground arena');
                expect(context.atst.damage).toBe(6);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 6]
                ]));

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.tielnFighter).toBeInLocation('discard');
                expect(context.hanSolo.damage).toBe(0);
            });

            it('should be able to choose 0 targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo]);
                context.player1.clickPrompt('Choose no targets');

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
                expect(context.wampa).toBeInLocation('ground arena');
                expect(context.wampa.damage).toBe(6);
                expect(context.atst).toBeInLocation('ground arena');
                expect(context.atst.damage).toBe(6);
            });
        });

        describe('Overwhelming Barrage\'s ability, if there is only one target for damage,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should not automatically select that target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            });
        });
    });
});
