describe('Endless Legions', function() {
    integration(function(contextRef) {
        it('Endless Legionsl\'s event ability should allows to play for free any number of resources', function() {
            contextRef.setupTest({
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
            context.player1.clickCard(context.relentless);
            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.cloneCommanderCody);
            context.player1.clickCard(context.admiralPiett);
            context.player1.clickCard(context.frozenInCarbonite);
            context.player1.clickCard(context.wrecker);
            context.player1.clickPrompt('Done');

            expect(context.getChatLogs(1)).toContain('player1 reveals Resupply, Relentless, Arquitens Assault Cruiser, Clone Commander Cody, Admiral Piett, Frozen in Carbonite, Wrecker due to Endless Legions');
            expect(context.player1).not.toHaveEnabledPromptButton('Choose no target');
            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.cloneCommanderCody,
                context.admiralPiett,
                context.relentless,
            ]);

            // Player 1 plays Admiral Piett for free
            context.player1.clickCard(context.admiralPiett);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.cloneCommanderCody,
                context.relentless,
            ]);

            // Player 1 plays Clone Commander Cody for free
            context.player1.clickCard(context.cloneCommanderCody);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wrecker,
                context.arquitensAssaultCruiser,
                context.relentless,
            ]);

            // Player 1 plays Wrecker for free
            context.player1.clickCard(context.wrecker);
            context.player1.clickPrompt('Defeat a friendly resource. If you do, deal 5 damage to a ground unit');

            // Player 1 defeats Relentless to deal 5 damage to Wampa
            context.player1.clickCard(context.relentless);
            context.player1.clickCard(context.wampa);

            // Player 1 triggers Wrecker's ambush
            context.player1.clickPrompt('Ambush');
            context.player1.clickCard(context.gor);

            expect(context.p2Base.damage).toBe(1);

            // Player 1 plays Arquitens Assault Cruiser for free
            expect(context.player1).toBeAbleToSelectExactly([
                context.arquitensAssaultCruiser,
            ]);

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickPrompt('Ambush');
            context.player1.clickCard(context.tieAdvanced);

            expect(context.p2Base.damage).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('Endless Legionsl\'s event ability should play no cards if no units are revealed', function() {
            contextRef.setupTest({
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

            expect(context.getChatLogs(1)).toContain('player1 reveals Resupply, Frozen in Carbonite, Confiscate due to Endless Legions');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
