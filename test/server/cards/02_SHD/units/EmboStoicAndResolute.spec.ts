describe('Embo, Stoic and Resolute', function () {
    integration(function (contextRef) {
        describe('Embo\'s ability', function () {
            it('should heal up to 2 damage from a unit when he kill someone and survives', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['embo#stoic-and-resolute', { card: 'escort-skiff', damage: 3 }],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force', 'swoop-racer', 'superlaser-technician'],
                    }
                });

                const { context } = contextRef;

                function reset(resetDamage = true) {
                    context.readyCard(context.embo);
                    if (resetDamage) {
                        context.setDamage(context.embo, 0);
                    }
                    context.player2.passAction();
                }

                // kill battlefield marine, should heal 2 from a unit
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.embo, context.escortSkiff, context.consularSecurityForce, context.swoopRacer, context.greenSquadronAwing, context.superlaserTechnician]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.escortSkiff, 2],
                ]));

                // heal escort skiff
                expect(context.escortSkiff.damage).toBe(1);
                expect(context.embo.damage).toBe(3);

                reset();

                // defender survives, nothing happen
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();

                reset();

                // defender is defeated but not in discard
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.superlaserTechnician);
                context.player2.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.embo, context.escortSkiff, context.consularSecurityForce, context.swoopRacer, context.greenSquadronAwing]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.escortSkiff, 2],
                ]));

                reset(false);

                // embo does not complete attack, nothing happen
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.swoopRacer);
                expect(context.player2).toBeActivePlayer();

                context.player1.moveCard(context.embo, 'groundArena');

                // embo kill a unit while defending, nothing happen
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.embo);
                expect(context.player1).toBeActivePlayer();
            });

            it('should heal up to 2 damage from a unit when he kill someone (by ability) and survives', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'embo#stoic-and-resolute', damage: 3, upgrades: ['vambrace-flamethrower'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // kill battlefield marine, should heal 2 from a unit
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Trigger');

                // kill battlefield marine with flamethrower, embo should heal up to 2 damage
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 3],
                ]));

                expect(context.player1).toBeAbleToSelectExactly([context.embo]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.embo, 2],
                ]));

                // heal embo
                expect(context.embo.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not heal up to 2 damage from a unit when killed and played again before his attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: [{ card: 'escort-skiff', damage: 3 }, 'embo#stoic-and-resolute'],
                    },
                    player2: {
                        hand: ['the-emperors-legion'],
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // kill consular security done
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.consularSecurityForce);

                // play again consular security force
                context.player2.clickCard(context.theEmperorsLegion);
                context.player1.passAction();
                context.player2.clickCard(context.consularSecurityForce);

                // embo does not kill, nothing happen
                context.player1.clickCard(context.embo);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
