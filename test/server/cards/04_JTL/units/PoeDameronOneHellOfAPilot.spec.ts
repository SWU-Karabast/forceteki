describe('Poe Dameron, One Hell of a Pilot', function() {
    integration(function(contextRef) {
        describe('Poe Dameron\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['poe-dameron#one-hell-of-a-pilot'],
                        groundArena: ['snowspeeder', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing', { card: 'restored-arc170', upgrades: ['r2d2#artooooooooo'] }],
                    },
                    player2: {
                        hand: ['bamboozle'],
                        groundArena: ['escort-skiff'],
                    }
                });
            });

            it('can move to the x-wing token Poe\'s ability created', function() {
                const { context } = contextRef;

                expect(context.restoredArc170).toHaveExactUpgradeNames(['r2d2#artooooooooo']);
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron');
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.allianceXwing,
                    context.snowspeeder,
                    xwingTokens[0]
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(xwingTokens[0]);
                expect(xwingTokens[0]).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot']);
            });

            it('can move to another vehicle unit than the x-wing created', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron');
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.allianceXwing,
                    context.snowspeeder,
                    xwingTokens[0]
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.snowspeeder);
                expect(context.snowspeeder).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot']);
            });

            it('can be pass to stay a groun unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron');
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.allianceXwing,
                    context.snowspeeder,
                    xwingTokens[0]
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.poeDameron).toBeInZone('groundArena');
            });

            it('can be play as pilot directly', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.allianceXwing,
                    context.restoredArc170,
                    context.snowspeeder,
                ]);
                context.player1.clickCard(context.restoredArc170);
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(0);
                expect(context.restoredArc170).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot', 'r2d2#artooooooooo']);
            });
        });
    });
});
