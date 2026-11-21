describe('Tantive IV, For Alderaan', function() {
    integration(function(contextRef) {
        describe('its constant ability', function() {
            it('gives Raid 2 and Saboteur to other friendly Rebel units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tantive-iv#for-alderaan']
                    },
                    player2: {
                        groundArena: [{ card: 'atst-raider', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine has Saboteur: the shield is defeated and the 5-power
                // attack (3 + Raid 2) defeats the 5-HP AT-ST outright
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atstRaider);

                expect(context.atstRaider).toBeInZone('discard');
                // Marine is defeated by the AT-ST's return damage as well
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('gives Raid 2 to friendly Rebel units attacking the base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tantive-iv#for-alderaan']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // Battlefield Marine is 3 power + Raid 2 → 5 damage to the base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
            });

            it('does not grant the keywords to itself or non-Rebel units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['tantive-iv#for-alderaan']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // Wampa is not Rebel: no Raid — 4 damage only
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Tantive IV is not buffed by its own ability — it deals only its printed 3 power
                context.player1.clickCard(context.tantiveIv);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
            });

            it('does not grant the keywords to enemy Rebel units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['tantive-iv#for-alderaan'],
                        groundArena: ['vigilant-honor-guards']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Enemy Battlefield Marine is Rebel but not friendly — no Raid 2, only its printed 3 power
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.vigilantHonorGuards]);
                context.player2.clickCard(context.vigilantHonorGuards);

                expect(context.vigilantHonorGuards.damage).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
