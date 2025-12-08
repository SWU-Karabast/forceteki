describe('Leia Organa, Someone who loves you', function() {
    integration(function(contextRef) {
        describe('Leia\'s leader undeployed ability', function() {
            it('pays 2 resources, exhausts Leia, and gives a unit +1/+1 per its aspects for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#someone-who-loves-you',
                        resources: 3,
                        groundArena: ['zeb-orrelios#spectre-four'] // Zeb has 3 aspects
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                // Use Leia's action ability and target Zeb
                context.player1.clickCard(context.leiaOrganaSomeoneWhoLovesYou);
                // With a single action ability, it should immediately go to target selection
                context.player1.clickCard(context.zebOrrelios);

                // Costs are paid
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.leiaOrganaSomeoneWhoLovesYou.exhausted).toBeTrue();

                // Zeb has 3 different aspects, so it should gain +3/+3 for this phase
                expect(context.zebOrrelios.getPower()).toBe(7); // base 4 + 3
                expect(context.zebOrrelios.getHp()).toBe(7);    // base 4 + 3

                // Move to next action phase; the temporary buff should wear off
                context.moveToNextActionPhase();
                expect(context.zebOrrelios.getPower()).toBe(4);
                expect(context.zebOrrelios.getHp()).toBe(4);
            });

            it('works with a unit that has a single aspect (+1/+1)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#someone-who-loves-you',
                        resources: 2,
                        spaceArena: ['awing'] // single aspect
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrganaSomeoneWhoLovesYou);
                context.player1.clickCard(context.awing);

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.leiaOrganaSomeoneWhoLovesYou.exhausted).toBeTrue();
                expect(context.awing.getPower()).toBe(2);
                expect(context.awing.getHp()).toBe(3);

                context.moveToNextActionPhase();
                expect(context.awing.getPower()).toBe(1);
                expect(context.awing.getHp()).toBe(2);
            });

            it('works with a unit that has a same aspects (+1/+1)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#someone-who-loves-you',
                        resources: 2,
                        groundArena: ['enterprising-lackeys'] // double command unit
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrganaSomeoneWhoLovesYou);
                context.player1.clickCard(context.enterprisingLackeys);

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.leiaOrganaSomeoneWhoLovesYou.exhausted).toBeTrue();
                expect(context.enterprisingLackeys.getPower()).toBe(6);
                expect(context.enterprisingLackeys.getHp()).toBe(6);

                context.moveToNextActionPhase();
                expect(context.enterprisingLackeys.getPower()).toBe(5);
                expect(context.enterprisingLackeys.getHp()).toBe(5);
            });
        });

        describe('Leia\'s leader deployed ability', function() {
            it('on deploy, chooses a unit and gives it Experience equal to unique aspects among your units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#someone-who-loves-you',
                        groundArena: ['zeb-orrelios#spectre-four', 'han-solo#hibernation-sick'],
                        spaceArena: ['jaunty-light-freighter']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
                const { context } = contextRef;

                // Deploy Leia
                context.player1.clickCard(context.leiaOrganaSomeoneWhoLovesYou);
                context.player1.clickPrompt('Deploy Leia Organa');

                expect(context.player1).toHavePrompt('Give 4 Experience tokens to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios, context.hanSolo, context.jauntyLightFreighter, context.leiaOrgana, context.battlefieldMarine, context.awing]);

                // Choose a unit to receive Experience; unique aspects among p1 units = {vigilance, aggression, heroism, command} => 4
                context.player1.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);

                // Turn should pass to player 2 afterward
                expect(context.player2).toBeActivePlayer();
            });

            it('on deploy, chooses a unit and gives it Experience equal to unique aspects among your units (multiple trigger)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#someone-who-loves-you',
                        groundArena: ['zeb-orrelios#spectre-four', 'han-solo#hibernation-sick'],
                        spaceArena: ['jaunty-light-freighter'],
                        resources: ['wampa', 'atst', 'wampa', 'atst', 'wampa', 'atst', 'tala-durith#i-can-get-you-inside']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
                const { context } = contextRef;

                // Deploy Leia
                context.player1.clickCard(context.leiaOrganaSomeoneWhoLovesYou);
                context.player1.clickPrompt('Deploy Leia Organa');

                expect(context.player1).toHaveExactPromptButtons(['Play Tala Durith using Plot', 'Choose a unit. Give an Experience token to that unit for each different aspect among units you control']);
                context.player1.clickPrompt('Play Tala Durith using Plot');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give 5 Experience tokens to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios, context.hanSolo, context.jauntyLightFreighter, context.leiaOrgana, context.battlefieldMarine, context.awing, context.talaDurith]);

                // Choose a unit to receive Experience; unique aspects among p1 units = {vigilance, aggression, heroism, command, cunning} => 4
                context.player1.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience', 'experience']);

                // Turn should pass to player 2 afterward
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
