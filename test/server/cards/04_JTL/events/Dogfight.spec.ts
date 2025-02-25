describe('Dogfight', function() {
    integration(function(contextRef) {
        describe('Dogfight\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dogfight'],
                        spaceArena: [{ card: 'frontline-shuttle', exhausted: true }, 'strafing-gunship'],
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'consular-security-force', 'c3po#protocol-droid']
                    },
                    player2: {
                        groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper'],
                    }
                });
            });

            it('should be able to attack with exhausted unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dogfight);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.c3poProtocolDroid,
                    context.strafingGunship
                    // We can't select frontline-shuttle because there is space unit to attack
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.bailOrganaRebelCouncilor,
                    context.sundariPeacekeeper
                ]);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.battlefieldMarine.damage).toBe(1);

                expect(context.dogfight).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to attack with non-exhausted unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dogfight);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.c3poProtocolDroid,
                    context.strafingGunship
                    // We can't select frontline-shuttle because there is space unit to attack
                ]);
                context.player1.clickCard(context.strafingGunship);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.bailOrganaRebelCouncilor,
                    context.sundariPeacekeeper
                ]);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.strafingGunship.exhausted).toBe(true);
                expect(context.strafingGunship.damage).toBe(0);

                expect(context.dogfight).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Dogfight\'s ability should not attack base if enemy has no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dogfight'],
                    groundArena: ['battlefield-marine', 'r2d2#ignoring-protocol', 'c3po#protocol-droid'],
                },
                player2: {
                    spaceArena: ['frontline-shuttle'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dogfight);

            expect(context.player2.base.damage).toBe(0);

            expect(context.dogfight).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
