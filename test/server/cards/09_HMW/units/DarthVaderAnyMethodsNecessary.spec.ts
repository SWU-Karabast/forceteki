describe('Darth Vader Any Methods Necessary', function() {
    integration(function(contextRef) {
        describe('Darth Vader Any Methods Necessary\'s ability', function() {
            it('should search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['wampa', 'village-tender', 'atst', 'battlefield-marine', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.villageTender, context.battlefieldMarine, context.rebelPathfinder, context.porg],
                    invalid: [context.protector, context.resupply, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    usesSelectionOrder: true,
                    selected: [context.wampa],
                    selectable: [context.villageTender, context.battlefieldMarine, context.rebelPathfinder, context.porg],
                    invalid: [context.protector, context.resupply, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.darthVader.damage).toBe(0);
                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);

                expect([context.villageTender, context.rebelPathfinder, context.porg, context.protector, context.resupply, context.atst]).toAllBeInBottomOfDeck(context.player1, 6);
            });

            it('should search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['cavern-angels-xwing', 'village-tender', 'atst', 'droid-missile-platform', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                context.player1.clickCardInDisplayCardPrompt(context.cavernAngelsXwing);
                context.player1.clickCardInDisplayCardPrompt(context.droidMissilePlatform);
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Deal 2 damage to a base');
                context.player1.clickCard(context.p2Base);

                expect(context.cavernAngelsXwing).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Deal 3 indirect damage to a player\'');
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3],
                ]));

                expect(context.player2).toBeActivePlayer();
            });

            it('should search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them (Heroic Arc-170 variant)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['heroic-arc170', 'village-tender', 'atst', 'droid-missile-platform', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                context.player1.clickCardInDisplayCardPrompt(context.heroicArc170);
                context.player1.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.heroicArc170.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.darthVader.damage).toBe(0);
            });

            it('should search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['heroic-arc170', 'trade-federation-shuttle', 'atst', 'droid-missile-platform', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                context.player1.clickCardInDisplayCardPrompt(context.heroicArc170);
                context.player1.clickCardInDisplayCardPrompt(context.tradeFederationShuttle);
                context.player1.clickPrompt('Play cards in selection order');

                expect(context.heroicArc170.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.tradeFederationShuttle.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should should be able to select less than 2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['wampa', 'village-tender', 'atst', 'battlefield-marine', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.darthVader.damage).toBe(0);
                expect(context.wampa.damage).toBe(2);
                expect([context.battlefieldMarine, context.villageTender, context.rebelPathfinder, context.porg, context.protector, context.resupply, context.atst]).toAllBeInBottomOfDeck(context.player1, 7);
            });
        });
    });
});
