
describe('Barriss Offee Unassuming Apprentice ability\'s', function() {
    integration(function(contextRef) {
        it('should give +1/0 to all unts healed this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['repair', 'redemption#medical-frigate'],
                    groundArena: ['barriss-offee#unassuming-apprentice', { card: 'battlefield-marine', damage: 0 }],
                }
            });

            const { context } = contextRef;

            // context.player1.clickCard(context.repair);
            // context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.redemption);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.battlefieldMarine, 2]
            ]));

            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.damage).toBe(0);
        });
    });
});
