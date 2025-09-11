describe('Arihnda Pryce, On The Road To Power', function () {
    integration(function (contextRef) {
        it('should allow defeating a friendly unit when Arihnda is defeated, then deal 4 to the enemy base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['arihnda-pryce#on-the-road-to-power', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Opponent defeats Arihnda by attacking with Wampa
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.arihndaPryceOnTheRoadToPower);

            // Can only select friendly units (battlefield-marine), not enemy units
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');

            // 4 damage dealt to opponent base
            expect(context.p2Base.damage).toBe(4);
        });

        it('should allow defeating a friendly unit when Arihnda is defeated, then deal 4 to the enemy base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-admiral-thrawn#how-unfortunate',
                    groundArena: ['arihnda-pryce#on-the-road-to-power', 'oomseries-officer', 'superlaser-technician']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.arihndaPryceOnTheRoadToPower);

            // trigger arihnda by defeating a first unit
            context.player1.clickCard(context.superlaserTechnician);

            // can exhaust thrawn to trigger again arihnda
            expect(context.player1).toHaveExactPromptButtons([
                'Exhaust this leader to use the When Defeated ability again',
                'Put Superlaser Technician into play as a resource and ready it'
            ]);

            // choose thrawn ability
            context.player1.clickPrompt('Exhaust this leader to use the When Defeated ability again');
            // trigger it
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to use the When Defeated ability again');
            context.player1.clickPrompt('Trigger');

            // choose oom series
            context.player1.clickCard(context.oomseriesOfficer);

            // deal 2 to enemy base
            context.player1.clickPrompt('Deal 2 damage to a base.');
            context.player1.clickCard(context.p2Base);

            // put SLT into resource
            expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
            context.player1.clickPrompt('Trigger');

            expect(context.p2Base.damage).toBe(10); // 4+4+2
            expect(context.player1).toBeActivePlayer();
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['arihnda-pryce#on-the-road-to-power']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Player2 defeats Arihnda using No Glory, Only Results
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.arihndaPryceOnTheRoadToPower);

            // They must defeat one of their own friendly units
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player2).toHavePassAbilityButton();
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');

            // 4 damage should be dealt to player1's base
            expect(context.p1Base.damage).toBe(4);
        });
    });
});
