describe('T6 Shuttle 1974, With A Mentor\'s Dedication', function() {
    integration(function(contextRef) {
        describe('Action ability', function() {
            it('should give another unit +2/+2 for this phase and allow attacking', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['t6-shuttle-1974#with-a-mentors-dedication', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.t6Shuttle1974);

                // Choose the action ability (not attack)
                expect(context.player1).toHavePrompt('Choose an ability:');
                context.player1.clickPrompt('Give another unit +2/+2 for this phase. You may attack with that unit');

                // Select another unit to buff
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine gets +2/+2
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
                expect(context.t6Shuttle1974.exhausted).toBe(true);

                // Optional attack prompt
                expect(context.player1).toHavePassAbilityPrompt('Attack with that unit');
                context.player1.clickPrompt('Trigger');

                // Attack with the buffed unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should allow buffing without attacking', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['t6-shuttle-1974#with-a-mentors-dedication']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.t6Shuttle1974);

                // Choose the action ability (not attack)
                expect(context.player1).toHavePrompt('Choose an ability:');
                context.player1.clickPrompt('Give another unit +2/+2 for this phase. You may attack with that unit');

                context.player1.clickCard(context.battlefieldMarine);

                // Pass on the attack
                expect(context.player1).toHavePassAbilityPrompt('Attack with that unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
            });

            it('should allow to target exhausted units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        spaceArena: ['t6-shuttle-1974#with-a-mentors-dedication']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.t6Shuttle1974);

                expect(context.player1).toHavePrompt('Choose an ability:');
                context.player1.clickPrompt('Give another unit +2/+2 for this phase. You may attack with that unit');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
            });
        });
    });
});
