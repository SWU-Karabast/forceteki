describe('Entrenched', function() {
    integration(function(contextRef) {
        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should prevent a unit from being able to attack base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);

                // attack resolved automatically since there's only one legal target
                expect(context.brightHope.damage).toBe(5);
                expect(context.tielnFighter.damage).toBe(2);
            });

            it('should prevent a unit with no opposing arena units from having the option to attack', function () {
                const { context } = contextRef;

                expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched'],
                        spaceArena: ['bright-hope#the-last-transport']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should work on an opponent\'s unit', function () {
                const { context } = contextRef;

                // play entrenched on opponent's card
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.tielnFighter);

                // perform attack, resolves automatically since there's only one legal target
                context.player2.clickCard(context.tielnFighter);
                expect(context.brightHope.damage).toBe(5);
                expect(context.tielnFighter.damage).toBe(2);
            });
        });
    });
});
