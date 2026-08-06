describe('Danger Squadron Wingmen', function() {
    integration(function(contextRef) {
        it('should give an Advantage token to friendly ground unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });

        it('should give an Advantage token to friendly space unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['advantage']);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });

        it('should give an Advantage token to friendly leader unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.grandInquisitor);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames(['advantage']);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });

        it('should give an Advantage token to enemy ground unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });

        it('should give an Advantage token to enemy space unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });

        it('should give an Advantage token to enemy leader unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames(['advantage']);
        });

        it('should be able to be passed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['danger-squadron-wingmen', 'lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['wampa'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dangerSquadronWingmen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([
                context.lurkingTiePhantom,
                context.battlefieldMarine,
                context.grandInquisitor,
                context.awing,
                context.wampa,
                context.lukeSkywalker
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.dangerSquadronWingmen).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.grandInquisitor).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalker).toHaveExactUpgradeNames([]);
        });
    });
});