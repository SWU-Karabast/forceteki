describe('Colonel Yularen, ISB Director', function() {
    integration(function(contextRef) {
        describe('Yularen\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['colonel-yularen#isb-director', 'battlefield-marine'],
                        base: { card: 'nevarro-city', damage: 3 }
                    },
                    player2: {
                        hand: ['vanguard-infantry']
                    }
                });
            });

            it('should heal 1 from friendly base when a friendly Command unit is played', function () {
                const { context } = contextRef;

                // CASE 1: Yularen heals when he himself is played
                context.player1.clickCard(context.colonelYularen);
                expect(context.p1Base.damage).toBe(2);

                // CASE 2: no heal when opponent plays a Command unit
                context.player2.clickCard(context.vanguardInfantry);
                expect(context.p1Base.damage).toBe(2);

                // CASE 3: heal happens when another friendly Command unit is played
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p1Base.damage).toBe(1);

                // double Yularen case is covered in UniqueRule.spec.ts
            });
        });
    });
});
