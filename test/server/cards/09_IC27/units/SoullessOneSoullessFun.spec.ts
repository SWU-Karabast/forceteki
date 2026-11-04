describe('Soulless One, Soulless Fun', function() {
    integration(function(contextRef) {
        describe('Soulless One\'s When Played ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['soulless-one#soulless-fun'],
                        groundArena: ['clone-trooper']
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['battlefield-marine', 'echo-base-defender'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('gives an enemy ground unit -3/-0 while it is in play', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.soullessOne);

                // Can only select enemy ground units
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.echoBaseDefender]);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine is a 3/3, reduced to 0/3
                expect(context.battlefieldMarine.getPower()).toBe(0);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                // Other units are unaffected
                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.cartelSpacer.getHp()).toBe(3);
                expect(context.cloneTrooper.getPower()).toBe(2);
                expect(context.cloneTrooper.getHp()).toBe(2);
            });

            it('effect lasts across phases and ends when Soulless One leaves play', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.soullessOne);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(0);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                context.moveToNextActionPhase();

                // Effect persists into the next phase
                expect(context.battlefieldMarine.getPower()).toBe(0);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                context.player1.passAction();

                // Defeat Soulless One, effect goes away
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.soullessOne);

                expect(context.soullessOne).toBeInZone('discard');
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });
    });
});
