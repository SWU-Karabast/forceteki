describe('Darth Sidious, The Phantom Menace', () => {
    integration(function (contextRef) {
        describe('When played', () => {
            it('may allow the player to use the force. If they do, defeat all non-Sith units with 3 or less remaining HP', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-sidious#the-phantom-menace'],
                        hasForceToken: true,
                        groundArena: [
                            'darth-vader#commanding-the-first-legion',
                            'sith-trooper',
                            'phaseiii-dark-trooper'
                        ],
                        spaceArena: [
                            'tie-dagger-vanguard'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                            { card: 'village-protectors', upgrades: ['shield'] }
                        ],
                        spaceArena: [
                            'green-squadron-awing'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Darth Sidious
                context.player1.clickCard(context.darthSidious);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use The Force\' or pass');
                context.player1.clickPrompt('Trigger');

                // Ensure the Force was used
                expect(context.player1.hasTheForce).toBe(false);

                // All non-Sith units with 3 or less remaining HP should be defeated
                expect(context.phaseiiiDarkTrooper).toBeInZone('discard');
                expect(context.villageProtectors).toBeInZone('discard');
                expect(context.greenSquadronAwing).toBeInZone('discard');

                // All Sith units and units with more than 3 remaining HP should remain in play
                expect(context.darthVader).toBeInZone('groundArena');
                expect(context.sithTrooper).toBeInZone('groundArena');
                expect(context.tieDaggerVanguard).toBeInZone('spaceArena');
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('allows the player to pass the optional ability', async () => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-sidious#the-phantom-menace'],
                        hasForceToken: true,
                        groundArena: [
                            'phaseiii-dark-trooper'
                        ],
                    }
                });

                const { context } = contextRef;

                // Play Darth Sidious
                context.player1.clickCard(context.darthSidious);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Trigger the ability \'Use The Force\' or pass');
                context.player1.clickPrompt('Pass');

                // Ensure the Force was not used
                expect(context.player1.hasTheForce).toBe(true);

                // No units should be defeated
                expect(context.phaseiiiDarkTrooper).toBeInZone('groundArena');
            });
        });
    });
});