describe('Kashyyyk Defender', function() {
    integration(function(contextRef) {
        it('Should allow to heal up to 2 damage on a unit and damage itself for the same value healed', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['kashyyyk-defender'],
                    groundArena: [{ card: 'morgan-elsbeth#keeper-of-many-secrets', damage: 1 }, { card: 'tactical-droid-commander', damage: 3 }],
                    resources: 30
                },
                player2: {
                    groundArena: ['plo-koon#kohtoyah', { card: 'battlefield-marine', damage: 2 }],
                    hand: ['waylay']
                }
            });

            const { context } = contextRef;

            // play card, heal 2 damage from enemy unit. Deals 2 damage to Kashyyyk Defender
            context.player1.clickCard(context.kashyyykDefender);
            expect(context.player1).toBeAbleToSelectExactly([context.morganElsbeth, context.tacticalDroidCommander, context.ploKoon, context.battlefieldMarine]);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.battlefieldMarine, 2],
            ]));
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.kashyyykDefender.damage).toBe(2);

            // reset card
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.kashyyykDefender);

            // play card, heal 1 damage from own unit. Deals 1 damage to Kashyyyk Defender
            context.player1.clickCard(context.kashyyykDefender);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.tacticalDroidCommander, 1],
            ]));
            expect(context.tacticalDroidCommander.damage).toBe(2);
            expect(context.kashyyykDefender.damage).toBe(1);

            // reset card
            context.player2.moveCard(context.waylay, 'hand');
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.kashyyykDefender);

            // play card, heal 0 damage from own unit. Deals 0 damage to Kashyyyk Defender
            context.player1.clickCard(context.kashyyykDefender);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.tacticalDroidCommander, 0],
            ]));
            expect(context.tacticalDroidCommander.damage).toBe(2);
            expect(context.kashyyykDefender.damage).toBe(0);

            // reset card
            context.player2.moveCard(context.waylay, 'hand');
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.kashyyykDefender);

            // play card, heal 2 damage from own unit, even though has only 1 damage on it. Deals 1 damage to Kashyyyk Defender
            context.player1.clickCard(context.kashyyykDefender);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.morganElsbeth, 1],
            ]));
            expect(context.morganElsbeth.damage).toBe(0);
            expect(context.kashyyykDefender.damage).toBe(1);
        });
    });
});
