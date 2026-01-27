describe('Jyn Erso, Take The Next Chance', function() {
    integration(function(contextRef) {
        describe('Jyn Erso, Take the Next Chance\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jyn-erso#take-the-next-chance'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }]
                    }
                });
            });

            it('should be able to give an Experience token to a itself', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                expect(context.player1).toHaveEnabledPromptButtons(['Give an Experience token to a unit', 'Exhaust a unit']);
                context.player1.clickPrompt('Give an Experience token to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.jynErsoTakeTheNextChance,
                    context.atst,
                    context.cartelSpacer,
                    context.grandInquisitorHuntingTheJedi,
                    context.wampa,
                    context.allianceXwing
                ]);
                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                expect(context.jynErsoTakeTheNextChance).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give an Experience token to an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                expect(context.player1).toHaveEnabledPromptButtons(['Give an Experience token to a unit', 'Exhaust a unit']);
                context.player1.clickPrompt('Give an Experience token to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.jynErsoTakeTheNextChance,
                    context.atst,
                    context.cartelSpacer,
                    context.grandInquisitorHuntingTheJedi,
                    context.wampa,
                    context.allianceXwing
                ]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give an Experience token to a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                expect(context.player1).toHaveEnabledPromptButtons(['Give an Experience token to a unit', 'Exhaust a unit']);
                context.player1.clickPrompt('Give an Experience token to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.jynErsoTakeTheNextChance,
                    context.atst,
                    context.cartelSpacer,
                    context.grandInquisitorHuntingTheJedi,
                    context.wampa,
                    context.allianceXwing
                ]);
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to target any unit to exhaust', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                context.player1.clickPrompt('Exhaust a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.jynErsoTakeTheNextChance,
                    context.atst,
                    context.cartelSpacer,
                    context.grandInquisitorHuntingTheJedi,
                    context.wampa,
                    context.allianceXwing
                ]);
                expect(context.wampa.exhausted).toBe(false);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBe(true);
            });
        });

        describe('Jyn Erso\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jyn-erso#take-the-next-chance']
                    }
                });
            });

            it('should do nothing if the controller selects "Exhaust a unit" when no other unit is on the field', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jynErsoTakeTheNextChance);
                context.player1.clickPrompt('Exhaust a unit');
                expect(context.player2).toBeActivePlayer();
                expect(context.jynErsoTakeTheNextChance).toBeInZone('groundArena');
                expect(context.jynErsoTakeTheNextChance.exhausted).toBe(true);
            });
        });
    });
});