describe('The Warrior, Deft Duelist', function () {
    integration(function (contextRef) {
        describe('The Warrior\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-warrior#deft-duelist',
                        hand: ['rugged-survivors', 'battlefield-marine', 'wampa', 'awing', 'curious-flock'],
                    },
                    player2: {
                        hand: ['amnesty-officer'],
                        groundArena: ['porg'],
                    },
                });
            });

            it('should allow the player to play a unit with 3 power or less, paying its cost, and give it Ambush for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theWarrior);
                context.player1.clickPrompt('Play a unit with 3 or less power from your hand. Give it Ambush for this phase');

                expect(context.player1).toBeAbleToSelectExactly([context.ruggedSurvivors, context.battlefieldMarine, context.awing, context.curiousFlock]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                context.moveToNextActionPhase();

                context.player1.passAction();

                context.player2.clickCard(context.amnestyOfficer);
                // his ability does not trigger, battlefield marine does not have Ambush anymore

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the player to play a unit with 3 power or less, paying its cost, and give it Ambush for the phase (modify power after being played and before Ambush)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theWarrior);
                context.player1.clickPrompt('Play a unit with 3 or less power from your hand. Give it Ambush for this phase');

                expect(context.player1).toBeAbleToSelectExactly([context.ruggedSurvivors, context.battlefieldMarine, context.awing, context.curiousFlock]);
                context.player1.clickCard(context.curiousFlock);

                expect(context.player1).toHaveEnabledPromptButtons(['Pay up to 6 resources. For each resource paid this way, give an Experience token to this unit', 'Ambush']);

                context.player1.clickPrompt('Pay up to 6 resources. For each resource paid this way, give an Experience token to this unit');
                context.player1.chooseListOption('6');

                // Resolve Ambush
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.curiousFlock.damage).toBe(1);

                expect(context.curiousFlock.getPower()).toBe(7);
                expect(context.curiousFlock.getHp()).toBe(7);
            });

            it('should allow the player to play a unit with 3 power or less and give him Ambush for the phase (even if there is not unit to Ambush)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theWarrior);
                context.player1.clickPrompt('Play a unit with 3 or less power from your hand. Give it Ambush for this phase');
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.damage).toBe(0);
                expect(context.awing.exhausted).toBeTrue();
            });
        });

        it('The Warrior\'s undeployed ability should not play unit with 3 or less power from hand and give them Ambush. It should not count any power modification from arenas', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-warrior#deft-duelist',
                    hand: ['battlefield-marine', 'wampa'],
                    groundArena: ['the-son#embodiment-of-darkness'],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theWarrior);
            context.player1.clickPrompt('Play a unit with 3 or less power from your hand. Give it Ambush for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Resolver Ambush
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();

            expect(context.battlefieldMarine.getPower()).toBe(5);
        });

        it('The Warrior\'s deployed ability should have Ambush and Raid 1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-warrior#deft-duelist',
                },
                player2: {
                    groundArena: ['consular-security-force'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theWarrior);
            context.player1.clickPrompt('Deploy The Warrior');
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();

            expect(context.consularSecurityForce.damage).toBe(4);
        });
    });
});
