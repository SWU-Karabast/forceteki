describe('Hera Syndulla, Spectre Two', function() {
    integration(function(contextRef) {
        describe('Hera\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa'],
                        leader: 'hera-syndulla#spectre-two',
                        base: 'echo-base'
                    }
                });
            });

            it('ignores aspect penalties for Spectre unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            // it('ignores aspect penalties for Spectre event', function () {
            //     const { context } = contextRef;
            // });

            it('does not ignore aspect penalties for non-Spectre card', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                expect(context.player1.countExhaustedResources()).toBe(6);
            });
        });

        describe('Hera\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa'],
                        groundArena: ['battlefield-marine', 'yoda#old-master'],
                        leader: 'hera-syndulla#spectre-two',
                        base: 'echo-base'
                    }
                });
            });

            it('ignores aspect penalties for Spectre unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            // it('ignores aspect penalties for Spectre event', function () {
            //     const { context } = contextRef;
            // });

            it('does not ignore aspect penalties for non-Spectre card', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                expect(context.player1.countExhaustedResources()).toBe(6);
            });

            // it('gives an experience token to a unique unit on attack', function () {
            // });
        });
    });
});
