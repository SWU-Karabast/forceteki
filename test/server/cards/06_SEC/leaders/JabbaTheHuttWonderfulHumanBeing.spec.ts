describe('Jabba the Hutt, Wonderful Human Being', function () {
    integration(function (contextRef) {
        describe('Jabba the Hutt\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#wonderful-human-being',
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }, { card: 'consular-security-force', damage: 3 }, 'specforce-soldier'],
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        resources: 3
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 1 }, 'atst']
                    }
                });
            });

            it('should choose a friendly damage unit to deal 1 damage to a enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce, context.awing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.atst.damage).toBe(1);
                expect(context.getChatLog()).toBe('player1 uses Jabba the Hutt, exhausting Jabba the Hutt to deal 1 damage to AT-ST with Battlefield Marine');
            });

            it('should choose a friendly damage unit to deal 2 damage (if having 3 damage or more) to a enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce, context.awing]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.atst.damage).toBe(2);
                expect(context.getChatLog()).toBe('player1 uses Jabba the Hutt, exhausting Jabba the Hutt to deal 2 damage to AT-ST with Consular Security Force');
            });
        });

        describe('Jabba the Hutt\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire', 'daring-raid'],
                        groundArena: ['wampa', 'atst']
                    },
                    player2: {
                        hand: ['death-trooper'],
                        leader: { card: 'jabba-the-hutt#wonderful-human-being', deployed: true },
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                        spaceArena: ['green-squadron-awing'],
                        base: 'security-complex'
                    }
                });
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (limit 1x per round)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);

                context.moveToNextActionPhase();

                context.setDamage(context.consularSecurityForce, 0);
                context.setDamage(context.wampa, 0);
                context.setDamage(context.battlefieldMarine, 0);
                context.setDamage(context.atst, 0);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(4);
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (work across arena)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(2);
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (does nothing if unit does not survive)', function () {
                const { context } = contextRef;

                context.setDamage(context.consularSecurityForce, 1);
                context.player1.passAction();

                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (unit attacks himself and survives)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (damage from friendly unit ability)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.deathTrooper);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.atst.damage).toBe(2);
            });

            it('should choose a friendly damage unit to deal 1 damage to a enemy unit when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (can pass)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);

                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.atst.damage).toBe(2);
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (only friendly units)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (only another units)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.jabbaTheHutt);

                expect(context.player2).toBeActivePlayer();
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (does nothing if unit does not survive (event))', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            });

            it('when a friendly unit is dealt damage and survives, you may deal that much damage to an enemy unit (does nothing if unit have a shield)', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.p2Base);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.battlefieldMarine.damage).toBe(0);
            });
        });
    });
});
