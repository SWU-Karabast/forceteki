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
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('ignores aspect penalties for Spectre unit and event', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.battlefieldMarine, context.yoda]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            // TODO: Add an upgrade test if a Spectre upgrade is ever printed
        });

        describe('Hera\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['karabast'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'yoda#old-master'],
                        leader: 'hera-syndulla#spectre-two',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'del-meeko#providing-overwatch']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('interacts properly with cost increase on events', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.delMeeko]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(3);
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
                        groundArena: ['pyke-sentinel'],
                        leader: { card: 'rey#more-than-a-scavenger', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('ignores aspect penalties for Spectre unit and event', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine, context.yoda, context.heraSyndulla, context.chopper, context.sabineWren]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.rey]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('gives an experience token to a unique unit on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);

                expect(context.player1).toHavePrompt('Choose a card');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.chopper, context.rey]);
                context.player1.clickCard(context.chopper);

                expect(context.chopper).toHaveExactUpgradeNames(['experience']);
                expect(context.heraSyndulla.damage).toBe(2);
                expect(context.pykeSentinel).toBeInZone('discard');
            });
        });
    });
});
