describe('Wingman Victor Two, Mauler Mithel', function() {
    integration(function(contextRef) {
        describe('Wingman Victor Two\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wingman-victor-two#mauler-mithel', 'survivors-gauntlet'],
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        hand: ['bamboozle']
                    }
                });
            });

            it('should create a TIE Fighter when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wingmanVictorTwo);
                context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
                context.player1.clickCard(context.tielnFighter);

                const tieFighters = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters.length).toBe(1);
                expect(tieFighters).toAllBeInZone('spaceArena');
                expect(tieFighters.every((tie) => tie.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);
            });

            it('should not create a TIE Fighter when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wingmanVictorTwo);
                context.player1.clickPrompt('Play Wingman Victor Two');

                const tieFighters = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters.length).toBe(0);
            });

            it('should correctly unregister and re-register triggered abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                // play WMV2 as pilot
                context.player1.clickCard(context.wingmanVictorTwo);
                context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
                context.player1.clickCard(context.tielnFighter);

                const tieFighters1 = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters1.length).toBe(1);
                expect(tieFighters1).toAllBeInZone('spaceArena');
                expect(tieFighters1.every((tie) => tie.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);

                // Bamboozle him back to hand
                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.tielnFighter);
                expect(context.wingmanVictorTwo).toBeInZone('hand');
                expect(context.tielnFighter.isUpgraded()).toBeFalse();

                // play him a second time as pilot, only one more tie should appear
                context.player1.clickCard(context.wingmanVictorTwo);
                context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
                context.player1.clickCard(context.tielnFighter);

                const tieFighters2 = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters2.length).toBe(2);
                expect(tieFighters2).toAllBeInZone('spaceArena');
                expect(tieFighters2.every((tie) => tie.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);
            });

            it('should not create a TIE Fighter when moved to another vehicle', function() {
                const { context } = contextRef;

                // play WMV2 as pilot
                context.player1.clickCard(context.wingmanVictorTwo);
                context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
                context.player1.clickCard(context.tielnFighter);

                const tieFighters1 = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters1.length).toBe(1);
                expect(tieFighters1).toAllBeInZone('spaceArena');
                expect(tieFighters1.every((tie) => tie.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);

                context.player2.passAction();

                // move him with Survivors' Gauntlet
                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.wingmanVictorTwo]);
                context.player1.clickCard(context.wingmanVictorTwo);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.survivorsGauntlet, tieFighters1[0]]);
                context.player1.clickCard(context.atst);

                // still only one TIE Fighter
                const tieFighters2 = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters2.length).toBe(1);
                expect(tieFighters2).toAllBeInZone('spaceArena');
                expect(tieFighters2.every((tie) => tie.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);
            });
        });
    });
});