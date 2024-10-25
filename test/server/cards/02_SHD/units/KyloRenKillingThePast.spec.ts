describe('Kylo Ren, Killing the Past', function() {
    integration(function(contextRef) {
        describe('Kylo Ren\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['kylo-ren#killing-the-past'],
                        groundArena: ['rey#keeping-the-past'],
                        base: 'kestro-city',
                        leader: 'leia-organa#alliance-general'
                    }
                });
            });

            it('ignores Villainy aspect penalty when unit Rey is controlled', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);

                // Kylo should cost 6 since it ignores the villainy aspect
                expect(context.player1.countExhaustedResources()).toBe(6);
            });
        });

        describe('Kylo Ren\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['kylo-ren#killing-the-past'],
                        base: 'kestro-city',
                        leader: 'rey#more-than-a-scavenger'
                    }
                });
            });

            it('ignores Villainy aspect penalty when Rey is the leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);

                // Kylo should cost 6 since it ignores the villainy aspect
                expect(context.player1.countExhaustedResources()).toBe(6);
            });
        });
    });
});
