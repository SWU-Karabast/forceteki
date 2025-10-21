
describe('Undo confirmation', function() {
    undoIntegration(function(contextRef) {
        it('should not require confirmation for the acting player to rollback if no randomness or new information was revealed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#foolish-gungan'],
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.republicArc170);
            context.player1.clickCard(context.p2Base);

            // P2 requires confirmation since P1's action is completed
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after random selection', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#foolish-gungan'],
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['restored-arc170'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;
            context.game.setRandomSeed('khgfk');

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Deny');

            contextRef.snapshot.quickRollback(context.player2.id);
            expect(context.player1).toHaveConfirmUndoPrompt();
            context.player1.clickPrompt('Allow');

            expect(context.player2).toBeActivePlayer();
        });

        it('should require confirmation to rollback after game end', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    base: { card: 'energy-conversion-lab', damage: 24 },
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;
            context.ignoreUnresolvedActionPhasePrompts = true;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.republicArc170);
            context.player1.clickCard(context.p2Base);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Deny');

            contextRef.snapshot.quickRollback(context.player2.id);
            expect(context.player1).toHaveConfirmUndoPrompt();
            context.player1.clickPrompt('Allow');

            expect(context.player2).toBeActivePlayer();
        });

        it('should require confirmationfor the acting player to rollback after a deck search', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['prepare-for-takeoff'],
                    deck: ['green-squadron-awing', 'battlefield-marine', 'restored-arc170', 'pyke-sentinel', 'inferno-four#unforgetting', 'escort-skiff', 'consular-security-force', 'echo-base-defender', 'swoop-racer'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.prepareForTakeoff);
            context.player1.clickCardInDisplayCardPrompt(context.greenSquadronAwing);
            context.player1.clickCardInDisplayCardPrompt(context.restoredArc170);
            context.player1.clickDone();

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after revealing cards from deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'atst',
                        'waylay',
                        'wampa',
                        'frontier-atrt'
                    ]
                },
                player2: {
                    groundArena: ['isb-agent'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.forACauseIBelieveIn);
            context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.waylay.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.frontierAtrt.uuid, 'top');

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should not require confirmation for the acting player to rollback after revealing cards from own hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['confiscate', 'waylay', 'isb-agent'],
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.isbAgent);
            context.player1.clickCard(context.confiscate);
            context.player2.clickDone();
            context.player1.clickCard(context.wampa);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after revealing cards from opponent', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['viper-probe-droid'],
                },
                player2: {
                    groundArena: ['wampa'],
                    hand: ['atst'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.viperProbeDroid);
            context.player1.clickDone();

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after making the opponent discard a card from hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-throw'],
                    groundArena: ['wampa', 'ezra-bridger#resourceful-troublemaker']
                },
                player2: {
                    hand: ['karabast', 'battlefield-marine'],
                    groundArena: ['specforce-soldier', 'atst'],
                    spaceArena: ['tieln-fighter'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.forceThrow);
            context.player1.clickPrompt('Opponent discards');
            context.player2.clickCard(context.karabast);
            context.player1.clickCard(context.atst);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after making the opponent discard a card from deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'chopper-base', damage: 5 },
                    groundArena: ['kanan-jarrus#revealed-jedi'],
                    leader: 'hera-syndulla#spectre-two',
                },
                player2: {
                    deck: ['battlefield-marine', 'pyke-sentinel', 'underworld-thug', 'the-chaos-of-war', 'volunteer-soldier'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.kananJarrus);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after taking control of an opponent resource', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    leader: 'han-solo#audacious-smuggler',
                    hand: ['strafing-gunship'],
                    // 10 resources total
                    resources: [
                        'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 10,
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.djBlatantThief);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after looking at own deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['inferno-four#unforgetting'],
                    deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay'],
                },
                player2: {
                    hand: ['atat-suppressor'],
                    resources: 10,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot for each player
            context.player1.passAction();
            context.player2.clickCard(context.atatSuppressor);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            context.player1.clickCard(context.infernoFour);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            context.player1.clickDisplayCardPromptButton(context.sabineWren.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'bottom');

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
            expect(context.infernoFour).toBeInZone('hand');

            // Play Inferno Four again but this time perform the undo while the prompt is still active
            context.player1.clickCard(context.infernoFour);
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
            expect(context.infernoFour).toBeInZone('hand');
        });

        it('should require confirmation for the acting player to rollback after drawing a card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['patrolling-vwing'],
                },
                player2: {
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.patrollingVwing);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should not require confirmation for the acting player to rollback after taking damage for drawing from an empty deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['patrolling-vwing'],
                    deck: [],
                },
                player2: {
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.patrollingVwing);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after the opponent is prompted to make a choice', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-am-your-father'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['viper-probe-droid'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.iAmYourFather);
            context.player1.clickCard(context.viperProbeDroid);

            context.player2.clickPrompt('Viper Probe Droid takes 7 damage');

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback after the opponent choose a target', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['power-of-the-dark-side'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['viper-probe-droid'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.powerOfTheDarkSide);
            context.player2.clickCard(context.viperProbeDroid);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();
        });

        it('should not require confirmation for rolling back one action if there is no opponent action in between', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'battlefield-marine'],
                },
                player2: {
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            context.player2.claimInitiative();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation for the acting player to rollback in the middle of a multi-step action', async function() {
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
                        'ahsoka-tano#chasing-whispers',
                        'wrecker#boom',
                    ],
                },
                player2: {
                    groundArena: ['hevy#staunch-martyr', 'gor#grievouss-pet'],
                    spaceArena: ['tie-advanced'],
                    hand: ['regional-governor', 'resupply'],
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.endlessLegions);
            context.player1.clickCard(context.admiralPiett);
            context.player1.clickCard(context.ahsokaTano);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();
            context.player2.clickDone();

            context.player1.clickCard(context.admiralPiett);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            context.player1.clickCard(context.ahsokaTano);
            context.player2.clickCard(context.resupply);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            context.player1.clickCard(context.battlefieldMarine);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('should reset confirmation requirement for the action after rolling back', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['patrolling-vwing'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            context.player1.clickCard(context.patrollingVwing);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();

            // do a different action and confirm we can undo without prompt
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.player1).toBeActivePlayer();
        });

        it('should reset to the correct point when triggering and undo request on the start of opponent\'s action', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['patrolling-vwing'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa'],
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;

            // Generate a quick snapshot
            context.player2.passAction();

            const p1UndoSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
            const p1UndoSnapshotActionNumber = contextRef.snapshot.getCurrentSnapshottedAction();

            context.player1.clickCard(context.patrollingVwing);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Allow');

            expect(context.player1).toBeActivePlayer();
            expect(contextRef.snapshot.getCurrentSnapshotId()).toBe(p1UndoSnapshotId);
            expect(contextRef.snapshot.getCurrentSnapshottedAction()).toBe(p1UndoSnapshotActionNumber);
        });

        describe('Free undo limits', function() {
            it('actions which require no confirmation are free, and count against the free undo limit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['republic-arc170']
                    },
                    enableConfirmationToUndo: true
                });

                const { context } = contextRef;

                // P1 attacks base with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Undo the attack (free undo, no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                // P1 attacks base with Republic ARC-170, free undo has been consumed
                context.player1.clickCard(context.republicArc170);
                context.player1.clickCard(context.p2Base);

                // Undo the attack (no longer free undo, confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Allow');

                expect(context.republicArc170.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('each player gets their own free undo before their limit is reached', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['tie-advanced']
                    },
                    enableConfirmationToUndo: true
                });

                const { context } = contextRef;

                // P1 attacks base with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Undo the attack (free undo, no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                // P1 attacks base with Republic ARC-170 instead
                context.player1.clickCard(context.republicArc170);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // P2 attacks base with Wampa
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // Undo the attack (free undo, no confirmation required)
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).not.toHaveConfirmUndoPrompt();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();

                // P2 attacks base with TIE Advanced instead
                context.player2.clickCard(context.tieAdvanced);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);

                // P1 attacks base with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Undo the attack (no longer free undo, confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Allow');
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(3);
                expect(context.player1).toBeActivePlayer();

                // P1 attacks base with Consular Security Force instead
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);

                // P2 attacks base with Wampa
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // Undo the attack (no longer free undo, confirmation required)
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt();
                context.player1.clickPrompt('Allow');
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('actions which require confirmation are not free, and do not count against the free undo limit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['favorable-delegate'],
                        groundArena: ['battlefield-marine', 'fighters-for-freedom'],
                        deck: ['reinforcement-walker']
                    },
                    enableConfirmationToUndo: true
                });

                const { context } = contextRef;

                // P1 plays Favorable Delegate and draws Reinforcement Walker to hand
                context.player1.clickCard(context.favorableDelegate);
                expect(context.reinforcementWalker).toBeInZone('hand', context.player1);

                // Undo playing Favorable Delegate (confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Allow');

                expect(context.favorableDelegate).toBeInZone('hand', context.player1);
                expect(context.reinforcementWalker).toBeInZone('deck', context.player1);
                expect(context.player1).toBeActivePlayer();

                // Attack base with Fighters for Freedom instead
                context.player1.clickCard(context.fightersForFreedom);
                context.player1.clickCard(context.p2Base);
                context.player2.claimInitiative();

                // Attack base with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Undo the Battlefield Marine attack (free undo hasn't been consumed, so no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(3); // Only damage from Fighters for Freedom, not Battlefield Marine
                expect(context.player1).toBeActivePlayer();
            });

            it('is unlimited when confirmation to undo is disabled', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['republic-arc170']
                    },
                    enableConfirmationToUndo: false
                });

                const { context } = contextRef;

                // P1 attacks base with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Undo the Battlefield Marine attack (no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                // P1 attacks base with Republic ARC-170 instead
                context.player1.clickCard(context.republicArc170);
                context.player1.clickCard(context.p2Base);

                // Undo the Republic ARC-170 attack (still no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.republicArc170.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                // P1 claims initiative
                context.player1.claimInitiative();

                // Undo claiming initiative (still no confirmation required)
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('If the player\'s action', function() {
            it('has been revealed by resolving an ability cost, the opponent requires confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['salacious-crumb#obnoxious-pet'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true
                });

                const { context } = contextRef;

                // generate a quick snapshot
                context.player2.passAction();

                // P1 activate Crumb ability, P2 sees the costs resolve
                context.player1.clickCard(context.salaciousCrumb);
                context.player1.clickPrompt('Deal 1 damage to a ground unit');

                expect(context.salaciousCrumb).toBeInZone('hand');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('has been revealed by asking the opponent to make a choice, the opponent requires confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('has been revealed by playing a card, the opponent requires confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['craving-power'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.cravingPower);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('has been revealed by triggering an attack, the opponent requires confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.viperProbeDroid);

                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.p1Base, context.p2Base]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('has been revealed, and the action is undone, the opponent still requires confirmation to undo back to their own action', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['craving-power'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.cravingPower);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                // P1 reveals Craving Power but then does an undo back to start of action
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).not.toHaveConfirmUndoPrompt();
                expect(context.cravingPower).toBeInZone('hand');
                expect(context.player1).toBeActivePlayer();

                // P2 still can't free undo to change their action
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeTrue();

                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt();
                context.player1.clickPrompt('Allow');
                expect(context.player2).toBeActivePlayer();
            });

            it('has not been revealed (event targeting), the opponent does not require confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.p1Base, context.p2Base]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('has not been revealed (attack targeting), the opponent does not require confirmation to undo', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true,
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.p2Base]);

                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
                expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });

        describe('Blocking the opponent\'s undo requests', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['favorable-delegate'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['patrolling-vwing'],
                        hasInitiative: true,
                    },
                    enableConfirmationToUndo: true
                });
            });

            it('is offered as an option after two undo rejections', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('undoRequestsBlocked');
                const result = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(result).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('is offered as an option after two undo rejections regardless of any accepted requests in between', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Allow');

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('undoRequestsBlocked');
                const result = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(result).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('is offered as an option after two undo rejections and from there on out, even if not used immediately', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Allow');

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('undoRequestsBlocked');
                const result = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(result).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not interfere with their ability to use a free undo', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('freeUndoAvailable');
                const result = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(result).toBeTrue();
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
            });

            it('does not interfere with the blocking player\'s ability to request an undo', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                context.player2.clickCard(context.patrollingVwing);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player2.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt(false);
                context.player1.clickPrompt('Allow');

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.patrollingVwing);
            });

            it('works correctly if both players have blocked each other', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.favorableDelegate);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(false);
                context.player2.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player2).toHaveConfirmUndoPrompt(true);
                context.player2.clickPrompt('Deny and Block Requests');

                context.player2.clickCard(context.patrollingVwing);

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player2.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt(false);
                context.player1.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player2.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt(false);
                context.player1.clickPrompt('Deny');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player2.id)).toBe('requestUndoAvailable');
                contextRef.snapshot.quickRollback(context.player2.id);
                expect(context.player1).toHaveConfirmUndoPrompt(true);
                context.player1.clickPrompt('Deny and Block Requests');

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player2.id)).toBe('undoRequestsBlocked');
                const result1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2.id
                });
                expect(result1).toBeFalse();
                expect(context.player1).toBeActivePlayer();

                expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe('undoRequestsBlocked');
                const result2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(result2).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
