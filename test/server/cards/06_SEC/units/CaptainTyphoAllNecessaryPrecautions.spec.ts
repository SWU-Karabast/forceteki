describe('Captain Typho, All Necessary Precautions', function () {
    integration(function (contextRef) {
        describe('Captain Typho\'s ability ', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['superlaser-technician', 'karabast'], // Command | Villainy, Aggression | Heroism
                        groundArena: ['captain-typho#all-necessary-precautions'],
                        base: { card: 'administrators-tower', damage: 2 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true,
                    }
                });
            });

            it('should, after disclosing Command and Heroism, heal 1 damage from your base', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.captainTypho);

                // Satisfy disclose [Command, Heroism] with Superlaser Technician (Command|Villainy) and Karabast (Aggression|Heroism)
                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickCard(context.karabast);
                context.player1.clickPrompt('Done');
                context.player2.clickDone();

                // Base should heal 1
                expect(context.p1Base.damage).toBe(1);
            });

            it('ability should not heal if the player declines to disclose the required aspects', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.captainTypho);

                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
