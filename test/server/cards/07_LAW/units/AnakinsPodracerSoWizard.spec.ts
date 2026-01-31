describe('Han Solo Reluctant Hero', function() {
    integration(function(contextRef) {
        describe('Han Solo Reluctant Hero\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakins-podracer#so-wizard'],
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['snowspeeder'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }, 'consular-security-force', 'battlefield-marine']

                    }
                });
            });

            it('while attacking an enemy ground unit, should deal damage to the defender before taking damage if no other units have attacked.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracerSoWizard).toBeInZone('groundArena');
                expect(context.anakinsPodracerSoWizard.damage).toBe(0);
            });

            it('while attacking an enemy ground unit, should not deal damage first if another friendly unit has attacked.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracerSoWizard).toBeInZone('discard');
            });

            it('while attacking an enemy ground unit, should not deal damage first if an enemy unit has attacked.', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracerSoWizard).toBeInZone('discard');
            });

            it('should work while attacking outside of ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickPrompt('Pass');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracerSoWizard).toBeInZone('groundArena');
                expect(context.anakinsPodracerSoWizard.damage).toBe(0);
            });

            it('should not work while attacking outside of ambush if another unit has attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickPrompt('Pass');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.anakinsPodracerSoWizard);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracerSoWizard).toBeInZone('discard');
            });
        });
    });
});