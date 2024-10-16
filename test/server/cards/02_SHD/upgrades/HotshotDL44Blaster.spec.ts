describe('Hotshot DL-44 Blaster', function() {
    integration(function(contextRef) {
        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        hand: ['hotshot-dl44-blaster']
                    },
                    base: 'tarkintown'
                });
            });

            it('does not initiate an attack when played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hotshotDl44Blaster);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [],
                        deck: ['wampa'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        base: 'administrators-tower'
                    }
                });
            });

            it('initiates an attack with the upgraded unit when Smuggled', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hotshotDl44Blaster);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
