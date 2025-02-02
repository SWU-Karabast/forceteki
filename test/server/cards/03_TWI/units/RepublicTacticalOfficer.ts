describe('Republic Tactical Officer', function() {
    integration(function(contextRef) {
        describe('Republic Tactical Officer\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['republic-tactical-officer'],
                        groundArena: ['wampa', 'admiral-yularen#advising-caution']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow triggering an attack by a unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.admiralYularen]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sundariPeacekeeper]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('if used with a republic unit should give it +2 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.sundariPeacekeeper.damage).toBe(4);
                expect(context.admiralYularen.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                context.player2.passAction();
                context.admiralYularen.exhausted = false;
                context.setDamage(context.sundariPeacekeeper, 0);
                context.setDamage(context.admiralYularen, 0);

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.admiralYularen.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(2);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInZone('groundArena');

                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the user to pass on the attack at the target select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInZone('groundArena');

                context.player1.clickCard(context.admiralYularen);

                context.player1.clickPrompt('Pass attack');
                expect(context.player2).toBeActivePlayer();
                expect(context.admiralYularen.exhausted).toBe(false);
            });
        });
    });
});
