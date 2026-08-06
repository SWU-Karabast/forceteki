describe('Fateful Goodbye', function() {
    integration(function(contextRef) {
        it('Fateful Goodbye\'s ability should distribute 3 Advantage tokens among friendly units if a friendly unit left play by defeat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.rebelPathfinder);

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.battlefieldMarine, 2],
                [context.awing, 1]
            ]), 'distributeAdvantage');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.rebelPathfinder).toBeInZone('discard', context.player1);
        });

        it('Fateful Goodbye\'s ability should distribute 3 Advantage tokens among friendly units if a friendly unit left play by bounce', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.rebelPathfinder);

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.battlefieldMarine, 2],
                [context.awing, 1]
            ]), 'distributeAdvantage');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.rebelPathfinder).toBeInZone('hand', context.player1);
        });

        it('Fateful Goodbye\'s ability should distribute 3 Advantage tokens among friendly units if a friendly unit left play by capture (token)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.arrest);
            context.player2.clickCard(context.cloneTrooper);

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.battlefieldMarine, 3],
            ]), 'distributeAdvantage');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            expect(context.cloneTrooper).not.toBeInZone('groundArena', context.player1);
        });

        it('Fateful Goodbye\'s ability should distribute 3 Advantage tokens among friendly units if a friendly unit left play by capture', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.arrest);
            context.player2.clickCard(context.rebelPathfinder);

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.battlefieldMarine, 2],
                [context.grandInquisitor, 1]
            ]), 'distributeAdvantage');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.grandInquisitor).toHaveExactUpgradeNames(['advantage']);
            expect(context.rebelPathfinder).not.toBeInZone('groundArena', context.player1);
        });

        it('Fateful Goodbye\'s ability should distribute 3 Advantage tokens among friendly units if NGOR is used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.atst);

            context.player2.passAction();

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.setDistributeAmongTargetsPromptState(new Map([
                [context.battlefieldMarine, 2],
                [context.awing, 1]
            ]), 'distributeAdvantage');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.atst).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should do nothing if enemy unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fellTheDragon);
            context.player1.clickCard(context.atst);

            context.player2.passAction();

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should do nothing if enemy leader unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'rivals-fall', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.sabineWren);

            context.player2.passAction();

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player1);
        });

        it('Fateful Goodbye\'s ability should do nothing if enemy leader upgrade leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'confiscate', 'fell-the-dragon', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'rivals-fall', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: 'wedge-antilles#leader-of-red-squadron',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a pilot');
            context.player2.clickCard(context.phoenixSquadronAwing);

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.wedgeAntilles);

            context.player2.passAction();

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player1);
        });

        it('Fateful Goodbye\'s ability should do nothing if enemy leader space unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fateful-goodbye', 'confiscate', 'rivals-fall', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'superlaser-blast', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: 'wedge-antilles#leader-of-red-squadron',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a pilot');
            context.player2.clickCard(context.phoenixSquadronAwing);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.phoenixSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.fatefulGoodbye);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player1);
            expect(context.phoenixSquadronAwing).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should do nothing if friendly leader upgrade leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['confiscate', 'rivals-fall', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'superlaser-blast', 'fateful-goodbye', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: 'wedge-antilles#leader-of-red-squadron',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a pilot');
            context.player2.clickCard(context.phoenixSquadronAwing);

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.wedgeAntilles);

            context.player2.clickCard(context.fatefulGoodbye);
            context.player2.clickPrompt('Play anyway');

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames([]);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should distribute 5 Advantage if friendly leader space unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['confiscate', 'rivals-fall', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'superlaser-blast', 'fateful-goodbye', 'waylay', 'arrest'],
                    groundArena: ['atst', 'wampa'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: 'wedge-antilles#leader-of-red-squadron',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a pilot');
            context.player2.clickCard(context.phoenixSquadronAwing);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.phoenixSquadronAwing);

            context.player2.clickCard(context.fatefulGoodbye);
            context.player2.setDistributeAmongTargetsPromptState(new Map([
                [context.atst, 5],
            ]), 'distributeAdvantage');

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage', 'advantage']);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should distribute 5 Advantage if friendly leader unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['confiscate', 'rivals-fall', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['vanquish', 'superlaser-blast', 'fateful-goodbye', 'waylay', 'arrest'],
                    groundArena: ['atst', 'wampa'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'wedge-antilles#leader-of-red-squadron', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.wedgeAntilles);

            context.player2.clickCard(context.fatefulGoodbye);
            context.player2.setDistributeAmongTargetsPromptState(new Map([
                [context.atst, 5],
            ]), 'distributeAdvantage');

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage', 'advantage']);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player2);
        });

        it('Fateful Goodbye\'s ability should distribute 5 Advantage if both friendly unit and leader unit leave play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superlaser-blast', 'rivals-fall', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine', 'clone-trooper', 'rebel-pathfinder'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    hand: ['wampa', 'fateful-goodbye', 'waylay', 'arrest'],
                    groundArena: ['atst'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'wedge-antilles#leader-of-red-squadron', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.superlaserBlast);

            context.player2.clickCard(context.wampa);
            context.player1.passAction();

            context.player2.clickCard(context.fatefulGoodbye);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage', 'advantage']);
            expect(context.fatefulGoodbye).toBeInZone('discard', context.player2);
        });
    });
});