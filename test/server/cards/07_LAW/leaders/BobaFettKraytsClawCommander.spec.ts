describe('Boba Fett, Krayt\'s Claw Commander', function() {
    integration(function(contextRef) {
        describe('Boba Fett\'s leader undeployed ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        leader: 'boba-fett#krayts-claw-commander',
                        groundArena: ['hunter-for-hire', 'wampa']
                    },
                    player2: {
                        groundArena: ['4lom#devious', 'atst', 'escort-skiff', 'battlefield-marine'],
                    }
                });
            });

            const promptText = 'You may exhaust Boba Fett. If you do, create a Credit token.';

            it('can create a credit token when a friendly Bounter Hunter unit defeats a unit on attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hunterForHire);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt(promptText);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.credits).toBe(1);
                expect(context.bobaFett.exhausted).toBeTrue();
            });

            it('will trigger even if the attacker is also defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hunterForHire);
                context.player1.clickCard(context.escortSkiff);

                expect(context.player1).toHavePassAbilityPrompt(promptText);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.credits).toBe(1);
                expect(context.bobaFett.exhausted).toBeTrue();
            });

            it('will not trigger if the attacker is not a Bounty Hunter', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.credits).toBe(0);
                expect(context.bobaFett.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('will not trigger if the attacking Bounty Hunter is defeated but the defender is not', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hunterForHire);
                context.player1.clickCard(context.atst);

                expect(context.player1.credits).toBe(0);
                expect(context.bobaFett.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('will not trigger for an opponent\'s Bounty Hunter attack', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context._4lom);
                context.player2.clickCard(context.hunterForHire);

                expect(context.player1).not.toHavePassAbilityPrompt(promptText);
                expect(context.player1.credits).toBe(0);
                expect(context.bobaFett.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('will not trigger when an opponent\'s attacking unit is defeated by a friendly defending Bounty Hunter', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.hunterForHire);

                expect(context.player1).not.toHavePassAbilityPrompt(promptText);
                expect(context.player1.credits).toBe(0);
                expect(context.bobaFett.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
