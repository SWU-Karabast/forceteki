describe('Hera Syndulla, Spectre Two', function() {
    integration(function(contextRef) {
        describe('Hera\'s undeployed ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
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
                });
            });

            it('ignores aspect penalties for Spectre unit ', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('ignores aspect penalties for Spectre event', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('does not ignores aspect penalties for non-Spectre unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        describe('Hera\'s undeployed ability', function() {
            it('ignores aspect penalties for Spectre pilot upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hera-syndulla#weve-lost-enough'],
                        spaceArena: ['concord-dawn-interceptors'],
                        leader: 'hera-syndulla#spectre-two',
                        base: 'echo-base'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndullaWeveLostEnough);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors]);
                context.player1.clickCard(context.concordDawnInterceptors);

                expect(context.heraSyndullaWeveLostEnough).toBeAttachedTo(context.concordDawnInterceptors);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('interacts properly with cost increase on events', async function () {
                await contextRef.setupTestAsync({
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
                });

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
                return contextRef.setupTestAsync({
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
                });
            });

            it('ignores aspect penalties for Spectre unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sabineWren);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('ignores aspect penalties for Spectre event', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.karabast);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine, context.yoda, context.heraSyndulla, context.chopper]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.rey]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('does not ignores aspect penalties for non-Spectre unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('gives an experience token to a unique unit on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.player1).toHavePrompt('Give an experience token to another unique unit');
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
