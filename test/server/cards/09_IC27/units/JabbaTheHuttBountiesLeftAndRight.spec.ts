describe('Jabba the Hutt, Bounties Left and Right', function() {
    integration(function(contextRef) {
        it('should give the attacker +4/+0 for the phase while the chosen enemy unit is defending', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jabba-the-hutt#bounties-left-and-right', 'snowtrooper-lieutenant', 'wampa', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst', 'reinforcement-walker'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jabbaTheHutt);
            expect(context.player1).toHaveEnabledPromptButton('Choose an enemy unit. For this phase, while that unit is defending, the attacker gets +4/+0');

            context.player1.clickPrompt('Choose an enemy unit. For this phase, while that unit is defending, the attacker gets +4/+0');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reinforcementWalker]);

            context.player1.clickCard(context.atst);
            expect(context.jabbaTheHutt.exhausted).toBe(true);

            // Snowtrooper Lieutenant attacks the chosen AT-ST first: boosted to 6 power, deals 6 damage which is not enough to defeat it (7 HP)
            context.player2.passAction();
            context.player1.clickCard(context.snowtrooperLieutenant);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(6);
            expect(context.snowtrooperLieutenant).toBeInZone('discard', context.player1);

            // Wampa attacks the chosen AT-ST: gets +4/+0 for the attack and deals 8 damage, defeating it
            // AT-ST has 1 HP remaining, so Wampa's Overwhelm deals 7 excess damage to the enemy base
            context.player2.passAction();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);

            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.p2Base.damage).toBe(7);

            // Battlefield Marine attacks the unchosen Reinforcement Walker: no bonus, deals only 3 damage
            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.reinforcementWalker);

            expect(context.reinforcementWalker.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should boost Raddus (Holdo\'s Final Command) power for his When Defeated ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jabba-the-hutt#bounties-left-and-right'],
                    spaceArena: ['raddus#holdos-final-command'],
                },
                player2: {
                    groundArena: ['reinforcement-walker'],
                    spaceArena: ['defiant-hammerhead'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jabbaTheHutt);
            context.player1.clickPrompt('Choose an enemy unit. For this phase, while that unit is defending, the attacker gets +4/+0');
            context.player1.clickCard(context.defiantHammerhead);

            // Raddus attacks the chosen Defiant Hammerhead at 12 power: both are defeated
            context.player2.passAction();
            context.player1.clickCard(context.raddus);
            context.player1.clickCard(context.defiantHammerhead);

            expect(context.defiantHammerhead).toBeInZone('discard', context.player2);
            expect(context.raddus).toBeInZone('discard', context.player1);

            // Raddus was defeated at 12 power, so his When Defeated ability deals 12 damage
            expect(context.player1).toHavePrompt('Deal 12 damage to an enemy unit');
            context.player1.clickCard(context.reinforcementWalker);
            expect(context.reinforcementWalker).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
