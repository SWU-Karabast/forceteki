describe('Hotshot DL-44 Blaster', function() {
    integration(function(contextRef) {
        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        hand: ['hotshot-dl44-blaster'],
                        base: 'tarkintown'
                    },
                });
            });

            it('does not initiate an attack when played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hotshotDl44Blaster);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.getChatLogs(3)).toContain('player1 plays Hotshot DL-44 Blaster, attaching it to Battlefield Marine');
            });
        });

        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [],
                        deck: ['wampa'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        base: 'administrators-tower'
                    },
                });
            });

            it('initiates an attack with the upgraded unit when Smuggled', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hotshotDl44Blaster);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(5);
                expect(context.getChatLogs(3)).toContain('player1 plays Hotshot DL-44 Blaster using Smuggle, attaching it to Battlefield Marine');
            });
        });
    });
});
