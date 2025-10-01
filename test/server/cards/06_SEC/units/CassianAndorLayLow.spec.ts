describe('Cassian Andor, Lay Low', function() {
    integration(function(contextRef) {
        describe('Cassian Andor, Lay Low\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blood-sport', 'open-fire', 'torpedo-barrage'],
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    },
                    player2: {
                        hand: ['daring-raid', 'covering-the-wing'],
                        groundArena: ['resourceful-pursuers', 'cargo-juggernaut', 'cassian-andor#lay-low']
                    }
                });
            });

            it('should give -2/-0 to the attacker while Cassian is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndorLayLow.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(2);

                // Should not give Cassian or defender -2/-0 when he attacks
                context.player2.clickCard(context.cassianAndorLayLow);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.cassianAndorLayLow).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should not give -2/-0 to the attacker while attacking one of Cassian\'s friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.resourcefulPursuers);

                expect(context.resourcefulPursuers.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should prevent 2 damage from enemy card abilities', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bloodSport);

                expect(context.resourcefulPursuers.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.cargoJuggernaut.isUpgraded()).toBeFalse();
                expect(context.cassianAndorLayLow.damage).toBe(0);
            });

            it('should prevent only 2 damage from enemy card abilities', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndor).toBeInZone('discard');
            });

            it('should not prevent damage from friendly card abilities', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndorLayLow).toBeInZone('discard');
            });

            it('should not prevent indirect damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.torpedoBarrage);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3],
                    [context.cassianAndorLayLow, 2],
                ]));

                expect(context.cassianAndorLayLow).toBeInZone('discard');
            });

            it('should prevent damage to prevent defeating shield', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.coveringTheWing);
                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.cassianAndorLayLow);

                context.player1.clickCard(context.bloodSport);

                context.player2.clickPrompt('If an enemy card ability would do damage to this unit, prevent 2 of that damage');

                expect(context.cassianAndor).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});