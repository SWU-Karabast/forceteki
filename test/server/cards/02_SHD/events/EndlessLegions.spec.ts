describe('Endless Legions', function() {
    integration(function(contextRef) {
        it('Endless Legionsl\'s event ability should allows to play for free any number of resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-moff-tarkin#oversector-governor',
                    hand: ['endless-legions'],
                    base: 'echo-base',
                    resources: [
                        'discerning-veteran',
                        'snowspeeder',
                        'specforce-soldier',
                        'ruthless-raider',
                        'pelta-supply-frigate',
                        'frozen-in-carbonite',
                        'confiscate',
                        'pyke-sentinel',
                        'battlefield-marine',
                        'admiral-piett#captain-of-the-executor',
                        'relentless#konstantines-folly',
                        'clone-commander-cody#commanding-the-212th',
                        'arquitens-assault-cruiser',
                        'resupply',
                        'wrecker#boom',
                    ],
                    groundArena: [{ card: '97th-legion#keeping-the-peace-on-sullust', damage: 11 }],
                },
                player2: {
                    groundArena: ['hevy#staunch-martyr', 'gor#grievouss-pet'],
                    spaceArena: ['tie-advanced'],
                    hand: ['regional-governor'],
                    hasInitiative: true,
                },
            });

            const { context } = contextRef;

            // Player 2 plays Regional Governor and says Battlefield Marine
            context.player2.clickCard(context.regionalGovernor);
            context.player2.chooseListOption('Battlefield Marine');

            // Player 1 plays Endless Legions
            context.player1.clickCard(context.endlessLegions);
            expect(context.player1).toBeAbleToSelectExactly([
                context.discerningVeteran,
                context.snowspeeder,
                context.specforceSoldier,
                context.ruthlessRaider,
                context.peltaSupplyFrigate,
                context.frozenInCarbonite,
                context.confiscate,
                context.pykeSentinel,
                context.battlefieldMarine,
                context.admiralPiett,
                context.relentless,
                context.cloneCommanderCody,
                context.arquitensAssaultCruiser,
                context.resupply,
                context.wrecker,
            ]);

            context.player1.clickCard(context.resupply);
            context.player1.clickCard(context.relentless);
            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.peltaSupplyFrigate);
            context.player1.clickCard(context.admiralPiett);
            context.player1.clickCard(context.frozenInCarbonite);
            context.player1.clickCard(context.wrecker);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            expect(context.getChatLogs(1)[0]).toContain(context.resupply.title);
            expect(context.getChatLogs(1)[0]).toContain(context.relentless.title);
            expect(context.getChatLogs(1)[0]).toContain(context.arquitensAssaultCruiser.title);
            expect(context.getChatLogs(1)[0]).toContain(context.peltaSupplyFrigate.title);
            expect(context.getChatLogs(1)[0]).toContain(context.admiralPiett.title);
            expect(context.getChatLogs(1)[0]).toContain(context.frozenInCarbonite.title);
            expect(context.getChatLogs(1)[0]).toContain(context.wrecker.title);
            expect(context.getChatLogs(1)[0]).toContain(context.battlefieldMarine.title);

            expect(context.player2).toHaveExactViewableDisplayPromptCards([
                context.resupply,
                context.relentless,
                context.arquitensAssaultCruiser,
                context.peltaSupplyFrigate,
                context.admiralPiett,
                context.frozenInCarbonite,
                context.wrecker,
                context.battlefieldMarine,
            ]);
            context.player2.clickPrompt('Done');

            expect(context.player1).not.toHaveEnabledPromptButton('Choose no target');

            // Only the units are selectable
            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.peltaSupplyFrigate,
                context.admiralPiett,
                context.relentless,
            ]);

            // Player 1 plays Admiral Piett for free
            context.player1.clickCard(context.admiralPiett);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.peltaSupplyFrigate,
                context.relentless,
            ]);

            // Player 1 plays Pelta Supply Frigate for free
            context.player1.clickCard(context.peltaSupplyFrigate);

            expect(context.player1.findCardsByName('clone-trooper').length).toBe(1);
            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.relentless,
            ]);

            // Player 1 plays Wrecker for free
            expect(context._97thLegion).toBeInZone('groundArena', context.player1);
            context.player1.clickCard(context.wrecker);
            context.player1.clickPrompt('Defeat a friendly resource. If you do, deal 5 damage to a ground unit');

            // Player 1 defeats Relentless to deal 5 damage to Battle Droid Legion
            context.player1.clickCard(context.relentless);
            expect(context._97thLegion).toBeInZone('discard', context.player1);

            context.player1.clickCard(context.hevy);
            expect(context.admiralPiett.damage).toBe(1);
            expect(context.wrecker.damage).toBe(1);
            expect(context.peltaSupplyFrigate.damage).toBe(0);
            expect(context.player1.findCardsByName('clone-trooper').every((cloneTrooper) => cloneTrooper.damage === 1)).toBeTrue();

            // Player 1 triggers Wrecker's ambush
            context.player1.clickPrompt('Ambush');
            context.player1.clickCard(context.gor);

            // Player 1 plays Arquitens Assault Cruiser for free
            expect(context.player1).toBeAbleToSelectExactly([
                context.arquitensAssaultCruiser,
            ]);

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickPrompt('Ambush');
            context.player1.clickCard(context.tieAdvanced);

            expect(context.player2).toBeActivePlayer();
        });

        it('Endless Legionsl\'s event ability should play no cards if no units are revealed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-moff-tarkin#oversector-governor',
                    hand: ['endless-legions'],
                    base: 'echo-base',
                    resources: [
                        'discerning-veteran',
                        'snowspeeder',
                        'specforce-soldier',
                        'ruthless-raider',
                        'tieln-fighter',
                        'frozen-in-carbonite',
                        'confiscate',
                        'pyke-sentinel',
                        'battlefield-marine',
                        'admiral-piett#captain-of-the-executor',
                        'relentless#konstantines-folly',
                        'clone-commander-cody#commanding-the-212th',
                        'arquitens-assault-cruiser',
                        'resupply',
                        'wrecker#boom',
                    ]
                },
                player2: {
                    groundArena: ['wampa', 'gor#grievouss-pet'],
                    spaceArena: ['tie-advanced'],
                },
            });

            const { context } = contextRef;

            // Player 1 plays Endless Legions
            context.player1.clickCard(context.endlessLegions);
            expect(context.player1).toBeAbleToSelectExactly([
                context.discerningVeteran,
                context.snowspeeder,
                context.specforceSoldier,
                context.ruthlessRaider,
                context.tielnFighter,
                context.frozenInCarbonite,
                context.confiscate,
                context.pykeSentinel,
                context.battlefieldMarine,
                context.admiralPiett,
                context.relentless,
                context.cloneCommanderCody,
                context.arquitensAssaultCruiser,
                context.resupply,
                context.wrecker,
            ]);

            context.player1.clickCard(context.resupply);
            context.player1.clickCard(context.frozenInCarbonite);
            context.player1.clickCard(context.confiscate);
            context.player1.clickPrompt('Done');

            expect(context.getChatLogs(1)[0]).toContain(context.resupply.title);
            expect(context.getChatLogs(1)[0]).toContain(context.frozenInCarbonite.title);
            expect(context.getChatLogs(1)[0]).toContain(context.confiscate.title);

            expect(context.player2).toHaveExactViewableDisplayPromptCards([
                context.resupply,
                context.frozenInCarbonite,
                context.confiscate
            ]);
            context.player2.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
