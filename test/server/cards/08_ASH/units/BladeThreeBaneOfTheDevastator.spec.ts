describe('Blade Three, Bane Of The Devastator', function() {
    integration(function(contextRef) {
        describe('Blade Three\'s triggered ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['blade-three#bane-of-the-devastator'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['daring-raid', 'devastator#hunting-the-rebellion'],
                        groundArena: ['atst', 'sabine-wren#explosives-artist', 'owen-lars#devoted-uncle'],
                        hasInitiative: true,
                    }
                });
            });

            it('should trigger when our base is damaged by combat damage', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage']);
            });

            it('should trigger when our base is damaged by combat damage (overwhelm)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage']);
            });

            it('should trigger when our base is damaged by indirect damage', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.devastator);
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 4],
                ]));
                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage']);
            });

            it('should not trigger when our base is attacked with 0-power unit', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.owenLars);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames([]);
            });

            it('should trigger when our base is damaged by ability damage', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage']);
            });

            it('should trigger when our base is damaged by event card', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage']);
            });

            it('should not trigger when enemy base is damaged', function () {
                const { context } = contextRef;

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames([]);
            });

            it('should work multiple times on a phase', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.bladeThreeBaneOfTheDevastator).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });
        });
    });
});
