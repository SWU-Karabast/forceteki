describe('Hera Syndulla, Spectre Two', function() {
    integration(function(contextRef) {
        describe('Hera\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa', 'karabast'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'yoda#old-master'],
                        leader: 'hera-syndulla#spectre-two',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });
            });

            it('ignores aspect penalties for Spectre unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            it('ignores aspect penalties for Spectre event', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.pykeSentinel).toBeInLocation('discard');
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            it('does not ignore aspect penalties for non-Spectre card', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                expect(context.player1.countExhaustedResources()).toBe(6);
            });

            // TODO: Add an upgrade test if a Spectre upgrade is ever printed
        });

        describe('Hera\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#explosives-artist', 'wampa', 'karabast'],
                        groundArena: ['battlefield-marine', 'yoda#old-master', 'chopper#metal-menace'],
                        leader: { card: 'hera-syndulla#spectre-two', deployed: true },
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });
            });

            it('ignores aspect penalties for Spectre unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            it('ignores aspect penalties for Spectre event', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine, context.yoda, context.heraSyndulla, context.chopper]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            it('does not ignore aspect penalties for non-Spectre card', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                expect(context.player1.countExhaustedResources()).toBe(6);
            });

            it('gives an experience token to a unique unit on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);

                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.chopper]);
                context.player1.clickCard(context.chopper);

                expect(context.chopper).toHaveExactUpgradeNames(['experience']);
                expect(context.heraSyndulla.damage).toBe(2);
                expect(context.pykeSentinel).toBeInLocation('discard');
            });
        });
    });
});
