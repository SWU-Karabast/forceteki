describe('Ahsoka Tano, I Learned It From You', function () {
    integration(function (contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superlaser-technician', 'karabast'], // Command|Villainy and Aggression|Heroism to satisfy disclose
                    groundArena: ['ahsoka-tano#i-learned-it-from-you', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['atst']
                }
            });
        });

        it('Ahsoka Tano\'s ability should, after disclosing, allow another friendly unit to immediately attack', function () {
            const { context } = contextRef;

            // First, Ahsoka attacks base to trigger her ability
            context.player1.clickCard(context.ahsokaTanoILearnedItFromYou);
            context.player1.clickCard(context.p2Base);
            const damageAfterAhsoka = context.p2Base.damage;

            // Disclose [Command, Heroism]
            expect(context.player1).toHavePrompt('Disclose Command, Heroism to attack with another unit');
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

        it('Ahsoka Tano\'s ability should not ask to disclose if she dies on her attack', function () {
            const { context } = contextRef;

            // First, Ahsoka attacks base to trigger her ability
            context.player1.clickCard(context.ahsokaTanoILearnedItFromYou);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
        });

        it('should allow passing on disclose and not grant an extra attack', function () {
            const { context } = contextRef;

            // Ahsoka attacks base to trigger her ability
            context.player1.clickCard(context.ahsokaTanoILearnedItFromYou);
            context.player1.clickCard(context.p2Base);
            const damageAfterAhsokaOnly = context.p2Base.damage;

            // Disclose window appears; choose to pass on disclosing
            expect(context.player1).toHavePrompt('Disclose Command, Heroism to attack with another unit');
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickPrompt('Choose nothing');

            // No extra attack should have occurred; damage remains the same
            expect(context.p2Base.damage).toBe(damageAfterAhsokaOnly);

            // After resolving, it should be Player 2's action (no immediate extra attack)
            expect(context.player2).toBeActivePlayer();
        });
    });
});
