describe('Kylo Ren, Killing the Past', function() {
    integration(function(contextRef) {
        describe('Kylo Ren\'s Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylo-ren#killing-the-past'],
                        groundArena: ['rey#keeping-the-past', 'pyke-sentinel'],
                        base: 'kestro-city',
                        leader: 'leia-organa#alliance-general'
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('ignores Villainy aspect penalty when unit Rey is controlled', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);

                // Kylo should cost 6 since it ignores the villainy aspect
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        describe('Kylo Ren\'s Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylo-ren#killing-the-past'],
                        base: 'kestro-city',
                        leader: 'rey#more-than-a-scavenger'
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('ignores Villainy aspect penalty when Rey is the leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);

                // Kylo should cost 6 since it ignores the villainy aspect
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        describe('Kylo Ren\'s Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kylo-ren#killing-the-past', 'pyke-sentinel', 'battlefield-marine', 'wild-rancor'],
                        base: 'kestro-city',
                        leader: 'rey#more-than-a-scavenger'
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('gives +2/0 and no Experience to a villainy unit', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.kyloRen.exhausted = false;
                    context.kyloRen.damage = 0;
                    context.wildRancor.damage = 0;
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                context.player1.clickCard(context.kyloRen);
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen, context.battlefieldMarine, context.pykeSentinel, context.concordDawnInterceptors, context.wildRancor]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.getPower()).toBe(4);
                expect(context.pykeSentinel.getHp()).toBe(3);

                // Ensure buff is gone
                context.moveToNextActionPhase();
                expect(context.pykeSentinel.getPower()).toBe(2);
                expect(context.pykeSentinel.getHp()).toBe(3);

                reset(false);

                // gives +2/0 and an Experience token to a non-Villainy/non-Heroism unit
                context.player1.clickCard(context.kyloRen);
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen, context.battlefieldMarine, context.pykeSentinel, context.concordDawnInterceptors, context.wildRancor]);
                context.player1.clickCard(context.wildRancor);
                expect(context.wildRancor.getPower()).toBe(9);
                expect(context.wildRancor.getHp()).toBe(9);

                // Ensure buff is gone but experience remains
                context.moveToNextActionPhase();
                expect(context.wildRancor.getPower()).toBe(7);
                expect(context.wildRancor.getHp()).toBe(9);

                reset(false);

                // gives +2/0 and an Experience to a non-Villainy unit
                context.player1.clickCard(context.kyloRen);
                expect(context.player1).toBeAbleToSelectExactly([context.kyloRen, context.battlefieldMarine, context.pykeSentinel, context.concordDawnInterceptors, context.wildRancor]);
                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.concordDawnInterceptors.getPower()).toBe(4);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);

                // Ensure buff is gone but experience remains
                context.moveToNextActionPhase();
                expect(context.concordDawnInterceptors.getPower()).toBe(2);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);
            });
        });
    });
});
