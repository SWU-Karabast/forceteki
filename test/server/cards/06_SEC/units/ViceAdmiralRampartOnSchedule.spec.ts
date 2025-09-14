describe('Vice Admiral Rampart, On Schedule', function () {
    integration(function (contextRef) {
        const disclosePrompt = 'Disclose Command, Command, Villainy to give an Experience token to each of up to 2 other units';

        it('discloses Command, Command, Villainy and gives up to 2 other units an Experience token on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'superlaser-technician', // Command | Villainy
                        'command'                // Command | Command
                    ],
                    groundArena: [
                        'vice-admiral-rampart#on-schedule',
                        'vanguard-infantry',
                        'battlefield-marine'
                    ],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Attack with Rampart to trigger disclose
            context.player1.clickCard(context.viceAdmiralRampart);
            context.player1.clickCard(context.p2Base);

            // Disclose window
            expect(context.player1).toHavePrompt(disclosePrompt);
            // Can select cards that can cover the required aspects
            expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.command]);

            // Select disclose cards
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.command);
            context.player1.clickDone();

            // Opponent sees the disclosed cards and clicks Done
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.superlaserTechnician, context.command]);
            context.player2.clickDone();

            // After disclosing, choose up to 2 other units to receive Experience tokens
            expect(context.player1).toHavePrompt('Give an Experience token to each of up to 2 other units');
            // Cannot select the source itself, only other units (both friendly and enemy allowed)
            expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);

            context.player1.clickCard(context.vanguardInfantry);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCardNonChecking(context.wampa);
            context.player1.clickDone();

            expect(context.vanguardInfantry).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.viceAdmiralRampart.isUpgraded()).toBeFalse();
            expect(context.wampa.isUpgraded()).toBeFalse();
        });

        it('allows choosing fewer than 2 targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superlaser-technician', 'command'],
                    groundArena: ['vice-admiral-rampart#on-schedule', 'vanguard-infantry']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.viceAdmiralRampart);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt(disclosePrompt);
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.command);
            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.wampa]);
            context.player1.clickCard(context.vanguardInfantry);
            context.player1.clickDone();

            expect(context.vanguardInfantry).toHaveExactUpgradeNames(['experience']);
            expect(context.viceAdmiralRampart.isUpgraded()).toBeFalse();
            expect(context.wampa.isUpgraded()).toBeFalse();
        });
    });
});
