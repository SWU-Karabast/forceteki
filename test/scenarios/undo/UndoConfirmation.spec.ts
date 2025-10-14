
describe('Undo confirmation', function() {
    undoIntegration(function(contextRef) {
        it('should not require confirmation to rollback if no randomness or new information was revealed', async function() {
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

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after random selection', async function() {
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

        it('should require confirmation to rollback after a deck search', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after revealing cards from deck', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should not require confirmation to rollback after revealing cards from own hand', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after revealing cards from opponent', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after making the opponent discard a card from hand', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after making the opponent discard a card from deck', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after taking control of an opponent resource', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after looking at own deck', async function() {
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

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeFalse();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            context.player1.clickCard(context.infernoFour);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            context.player1.clickDisplayCardPromptButton(context.sabineWren.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'bottom');

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

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

        it('should require confirmation to rollback after drawing a card', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should not require confirmation to rollback after taking damage for drawing from an empty deck', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after the opponent is prompted to make a choice', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            context.player2.clickPrompt('Allow');
            expect(context.player1).toBeActivePlayer();
        });

        it('should require confirmation to rollback after the opponent choose a target', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();
        });

        it('should require confirmation to rollback in the middle of a multi-step action', async function() {
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
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            context.player1.clickCard(context.ahsokaTano);
            context.player2.clickCard(context.resupply);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            context.player1.clickCard(context.battlefieldMarine);
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });
    });
});
