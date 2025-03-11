describe('Corvus, Inferno Squadron Raider', function() {
    integration(function(contextRef) {
        describe('Corvus\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corvus#inferno-squadron-raider'],
                        groundArena: [{ card: 'astromech-pilot', upgrades: ['devotion', 'protector'], damage: 2 }],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['determined-recruit'], damage: 1 }],
                        base: { card: 'echo-base', damage: 15 }
                    },
                    player2: {
                        groundArena: ['clone-pilot'],
                        spaceArena: [{ card: 'distant-patroller', upgrades: ['hopeful-volunteer'] }],
                    }
                });
            });

            it('can attach a pilot unit to it when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.astromechPilot);
                expect(context.corvus).toHaveExactUpgradeNames(['astromech-pilot']);
                expect(context.devotion).toBeInZone('discard');
                expect(context.protector).toBeInZone('discard');
                expect(context.corvus.damage).toBe(0);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['determined-recruit']);
            });

            it('can attach a pilot upgrade to it when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.determinedRecruit);
                expect(context.corvus).toHaveExactUpgradeNames(['determined-recruit']);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
                expect(context.greenSquadronAwing.damage).toBe(1);
                expect(context.corvus.damage).toBe(0);
            });

            it('can do nothing when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.corvus).toHaveExactUpgradeNames([]);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['determined-recruit']);
                expect(context.astromechPilot).toHaveExactUpgradeNames(['devotion', 'protector']);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.corvus);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(13); // restore 2
            });
        });
    });
});