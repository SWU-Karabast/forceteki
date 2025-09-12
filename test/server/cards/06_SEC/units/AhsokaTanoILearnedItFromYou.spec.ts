describe('Ahsoka Tano, I Learned It From You', function () {
    integration(function (contextRef) {
        it('Ahsoka Tano\'s ability should, after disclosing, allow another friendly unit to immediately attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superlaser-technician', 'karabast'], // Command|Villainy and Aggression|Heroism to satisfy disclose
                    groundArena: ['ahsoka-tano#i-learned-it-from-you', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            // First, Ahsoka attacks base to trigger her ability
            context.player1.clickCard(context.ahsokaTanoILearnedItFromYou);
            context.player1.clickCard(context.p2Base);
            const damageAfterAhsoka = context.p2Base.damage;

            // Disclose [Command, Heroism]
            expect(context.player1).toHavePrompt('Disclose Command, Heroism to attack with another unit');
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.karabast);
            context.player1.clickPrompt('Done');
            context.player2.clickDone();

            // Choose another friendly unit to attack and target base
            // Should not be able to choose Ahsoka as attacker
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            // Base should have taken 3 more damage (Battlefield Marine power = 3)
            expect(context.p2Base.damage).toBe(damageAfterAhsoka + 3);
        });
    });
});
