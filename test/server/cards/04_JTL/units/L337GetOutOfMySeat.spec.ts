describe('L3-37, Get Out of my seat', function() {
    integration(function(contextRef) {
        describe('L3-37\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'l337#get-out-of-my-seat', upgrades: ['jedi-lightsaber'], damage: 3 }, 'atst', { card: 'escort-skiff', upgrades: ['bb8#happy-beeps'] }, 'battlefield-marine'],
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['wingman-victor-two#mauler-mithel'] }, 'green-squadron-awing'],
                    },
                    player2: {
                        hand: ['traitorous'],
                        groundArena: ['wampa'],
                        spaceArena: ['mining-guild-tie-fighter'],
                    }
                });
            });


            it('should allow to attach it to a vehicle unit without pilot when defeated', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.l337);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['l337#get-out-of-my-seat']);
                expect(context.atst.damage).toBe(0);
                expect(context.jediLightsaber).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });

            it('can be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Pass');
                expect(context.l337).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('triggers nothing on Attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            // Todo: This test should pass
            it('let the opponent attach the L3-37 if they control it when defeated', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.l337);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.l337);
                context.player2.clickPrompt('Trigger');
                expect(context.player2).toBeAbleToSelectExactly([context.miningGuildTieFighter]);
                context.player2.clickCard(context.miningGuildTieFighter);
                expect(context.miningGuildTieFighter).toHaveExactUpgradeNames(['l337#get-out-of-my-seat']);
            });
        });
    });
});
