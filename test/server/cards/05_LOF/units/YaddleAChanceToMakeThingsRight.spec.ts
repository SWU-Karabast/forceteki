describe('Yaddle, A Chance to Make Things Right', function () {
    integration(function (contextRef) {
        describe('Yaddle\'s on-attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yaddle#a-chance-to-make-things-right', 'luke-skywalker#jedi-knight', 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: { card: 'echo-base', damage: 15 }
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                        base: { card: 'capital-city', damage: 5 }
                    }
                });
            });

            it('should give Restore 1 to other friendly Jedi units for the phase', function () {
                const { context } = contextRef;

                let p1BaseDamage = context.p1Base.damage;

                // Attack with Yaddle to trigger her ability
                context.player1.clickCard(context.yaddle);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Restore 1');
                expect(context.p1Base.damage).toBe(p1BaseDamage - 1); // only Restore 1, she should not have his ability boost

                const p2BaseDamage = context.p2Base.damage;
                // player 2 jedi units should not have Restore 1 from yaddle
                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);

                expect(context.p2Base.damage).toBe(p2BaseDamage - 2); // restore 2

                p1BaseDamage = context.p1Base.damage;

                // Attack with Luke (Jedi) - should have Restore 1
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Luke should have Restore 4
                expect(context.p1Base.damage).toBe(p1BaseDamage - 4);

                context.player2.passAction();
                p1BaseDamage = context.p1Base.damage;

                // Attack with Battlefield Marine (non-Jedi) - should not have Restore 1
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine should not have Restore 1
                expect(context.p1Base.damage).toBe(p1BaseDamage); // Unchanged, no Restore

                context.player2.passAction();
                p1BaseDamage = context.p1Base.damage;

                // attack with a space jedi unit (without force), he should have Restore 1
                context.player1.clickCard(context.jediLightCruiser);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(p1BaseDamage - 1);
            });

            it('should give Restore 2 if she attacks 2 time', function () {
                const { context } = contextRef;

                // Attack 2 times with Yaddle to trigger her ability twice
                context.player1.clickCard(context.yaddle);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Restore 1');

                context.yaddle.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.yaddle);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Restore 1');

                context.player2.passAction();
                const p1BaseDamage = context.p1Base.damage;

                // Attack with Luke (Jedi)
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Luke should have Restore 5
                expect(context.p1Base.damage).toBe(p1BaseDamage - 5);
            });

            it('should only last for the current phase', function () {
                const { context } = contextRef;

                // Attack with Yaddle to trigger her ability
                context.player1.clickCard(context.yaddle);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Restore 1');

                // Move to the next phase
                context.moveToNextActionPhase();
                const p1BaseDamage = context.p1Base.damage;

                // Attack with Luke in the new phase - should not have Restore 1 anymore
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(p1BaseDamage - 3);
            });
        });
    });
});