describe('Niman Strike', function() {
    integration(function(contextRef) {
        describe('Niman Strike\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['niman-strike'],
                        groundArena: ['battlefield-marine', { card: 'yoda#old-master', exhausted: true }, 'karis#we-dont-like-strangers']
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight', 'consular-security-force'],
                    }
                });
            });

            it('should be able to attack with exhausted Force unit and give it +1/+0 for this attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nimanStrike);

                // can select only force unit
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.karis]);
                context.player1.clickCard(context.yoda);

                // can't attack base
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();

                // should have +1/+0 for this attack
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.yoda.exhausted).toBe(true);
                expect(context.yoda.damage).toBe(3);

                expect(context.yoda.getPower()).toBe(2);
                expect(context.yoda.getHp()).toBe(4);
            });

            it('should be able to attack with non-exhausted Force unit and give it +1/+0 for this attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nimanStrike);

                // can select only force unit
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.karis]);
                context.player1.clickCard(context.karis);

                // can't select base even with a non-exhausted unit
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();

                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.karis.exhausted).toBe(true);
                expect(context.karis.damage).toBe(3);
            });
        });

        it('Niman Strike\'s ability should not attack base if enemy has no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['niman-strike'],
                    groundArena: ['yoda#old-master'],
                },
            });

            const { context } = contextRef;

            // soft pass if there isn't opponent's unit
            context.player1.clickCard(context.nimanStrike);
            context.player1.clickPrompt('Play anyway');

            expect(context.nimanStrike).toBeInZone('discard', context.player1);
            expect(context.player2.base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
