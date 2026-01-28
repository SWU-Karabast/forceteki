describe('Latts Razzi, Deadly Whisperer', function() {
    integration(function(contextRef) {
        describe('Latts Razzi\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whisperer'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: 'true' },
                    }
                });
            });

            it('should be able to give an Experience token to herself, then damage an enemy ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhisperer);
                expect(context.player1).toHaveEnabledPromptButtons(['Give a Shield token to this unit', 'Give an Experience token to this unit']);
                context.player1.clickPrompt('Give an Experience token to this unit');
                expect(context.lattsRazziDeadlyWhisperer).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toHavePrompt('Deal 3 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.darthVaderDarkLordOfTheSith
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give a Shield token to herself, then damage an enemy ground leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhisperer);
                expect(context.player1).toHaveEnabledPromptButtons(['Give a Shield token to this unit', 'Give an Experience token to this unit']);
                context.player1.clickPrompt('Give a Shield token to this unit');
                expect(context.lattsRazziDeadlyWhisperer).toHaveExactUpgradeNames(['shield']);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.darthVaderDarkLordOfTheSith
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.darthVaderDarkLordOfTheSith);
                expect(context.darthVaderDarkLordOfTheSith.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Latts Razzi\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whisperer'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should give token and then do no damage if there are no enemy ground units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhisperer);
                context.player1.clickPrompt('Give an Experience token to this unit');

                expect(context.lattsRazziDeadlyWhisperer.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
                expect(context.lattsRazziDeadlyWhisperer).toBeInZone('groundArena');
                expect(context.lattsRazziDeadlyWhisperer.exhausted).toBe(true);
            });
        });
    });
});