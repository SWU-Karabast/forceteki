describe('Rash Action', function () {
    integration(function (contextRef) {
        describe('Rash Action\'s event ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rash-action'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['takedown', 'yoda#old-master'],
                        groundArena: ['porg', 'consular-security-force'],
                    }
                });
            });

            it('should allow attacking with a unit that gets +1/+0 for the attack and cause opponent to discard as unit deals combat damage to their base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rashAction);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeAbleToSelectExactly([context.takedown, context.yoda]);
                expect(context.player2).not.toHaveChooseNothingButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(5);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.yoda).toBeInZone('discard');
            });

            it('should allow attacking with a unit that gets +1/+0 for the attack and cause opponent to discard as unit deals combat damage to their base (from overwhelm)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rashAction);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeAbleToSelectExactly([context.takedown, context.yoda]);
                expect(context.player2).not.toHaveChooseNothingButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(4);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.yoda).toBeInZone('discard');
            });

            it('should not cause opponent to discard if no combat damage dealt to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rashAction);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(0);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.yoda).toBeInZone('hand');
                expect(context.takedown).toBeInZone('hand');
            });
        });
    });
});
