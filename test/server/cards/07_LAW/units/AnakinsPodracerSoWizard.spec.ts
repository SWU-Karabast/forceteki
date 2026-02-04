describe('Anakin\'s Podracer, So Wizard', function() {
    integration(function(contextRef) {
        describe('Anakin\'s Podracers\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakins-podracer#so-wizard'],
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['snowspeeder'],
                    },
                    player2: {
                        groundArena: [
                            'gnk-power-droid',
                            'clone-trooper',
                            'battlefield-marine'
                        ],
                        hand: ['waylay']

                    }
                });
            });

            it('while attacking an enemy ground unit, should deal damage to the defender before taking damage if no other units have attacked.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('groundArena');
                expect(context.anakinsPodracer.damage).toBe(0);
                expect(context.getChatLogs(2)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer (dealing damage before the defender)');
            });

            it('while attacking an enemy ground unit, should not deal damage first if another friendly unit has attacked.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('discard');
                expect(context.getChatLogs(3)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer');
            });

            it('while attacking an enemy ground unit, should not deal damage first if an enemy unit has attacked.', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('discard');
                expect(context.getChatLogs(3)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer');
            });

            it('should not gain the effect if the first unit that attacked was defeated during the attack.', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 attacks with GNK Power Droid, defeating it
                context.player2.clickCard(context.gnkPowerDroid);
                context.player2.clickCard(context.snowspeeder);
                expect(context.gnkPowerDroid).toBeInZone('discard');

                // Ambush with Anakin's Podracer
                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Podracer should not deal damage first since another unit attacked this phase
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('discard');
                expect(context.getChatLogs(3)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer');
            });

            it('should work while attacking outside of ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickPrompt('Pass');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('groundArena');
                expect(context.anakinsPodracer.damage).toBe(0);
                expect(context.getChatLogs(2)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer (dealing damage before the defender)');
            });

            it('should not work while attacking outside of ambush if another unit has attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickPrompt('Pass');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('discard');
                expect(context.getChatLogs(3)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer');
            });

            it('should not prevent damage after being bounced', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.anakinsPodracer).toBeInZone('groundArena');
                expect(context.anakinsPodracer.damage).toBe(0);
                expect(context.getChatLogs(2)).toContain('player1 attacks Battlefield Marine with Anakin\'s Podracer (dealing damage before the defender)');

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.anakinsPodracer);

                context.player1.clickCard(context.anakinsPodracer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cloneTrooper);

                // Both are defeated since damage was dealt simultaneously
                expect(context.anakinsPodracer).toBeInZone('discard');
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.getChatLogs(3)).toContain('player1 attacks Clone Trooper with Anakin\'s Podracer');
            });
        });
    });
});