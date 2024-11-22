describe('Saw Gerrera, Extremist', function () {
    integration(function (contextRef) {
        it('should not prompt player if no units are available to return to hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['surprise-strike'],
                    groundArena: ['saw-gerrera#extremist'],
                },
                player2: {
                    hand: ['resupply', 'vanquish', 'battlefield-marine'],
                    resources: ['smugglers-aid', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            // opponent play an event : 2 damage on base
            context.player2.clickCard(context.resupply);
            expect(context.p2Base.damage).toBe(2);
            context.setDamage(context.p2Base, 0);

            // we play an event : nothing happen
            context.player1.clickCard(context.surpriseStrike);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(8); // 5+3

            // opponent play an event from smuggle : 2 damage on base
            context.player2.clickCard(context.smugglersAid);
            expect(context.p2Base.damage).toBe(7);
            context.setDamage(context.p2Base, 0);

            context.player1.passAction();

            // opponent play a unit : nothing happen
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.p2Base.damage).toBe(0);

            context.player1.passAction();

            // opponent play a unit and kill saw gerrera : 2 damage on base
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.sawGerrera);
            expect(context.p2Base.damage).toBe(2);
            expect(context.sawGerrera).toBeInZone('discard');
        });
    });
});
