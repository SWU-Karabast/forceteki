describe('Fett\'s Firespray, Pursuing The Bounty', function () {
    integration(function (contextRef) {
        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        leader: 'boba-fett#daimyo'
                    },
                });
            });

            it('should be ready when you control SHD Boba Fett leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when you control SHD Boba Fett leader unit', function () {
                const { context } = contextRef;
                context.bobaFett.deployed = true;
                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        leader: 'boba-fett#collecting-the-bounty'
                    },
                });
            });

            it('should be ready when you control SOR Boba Fett leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when you control SOR Boba Fett leader unit', function () {
                const { context } = contextRef;
                context.bobaFett.deployed = true;
                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Fett\'s Firespray\'s When Played ability should not be ready if we do not control any Boba Fett or Jango Fett', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#pursuing-the-bounty'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    leader: 'chirrut-imwe#one-with-the-force'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            expect(context.fettsFirespray.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        it('Fett\'s Firespray\'s When Played ability should be ready as we control Boba Fett unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#pursuing-the-bounty'],
                    groundArena: ['boba-fett#disintegrator'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    leader: 'chirrut-imwe#one-with-the-force'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            expect(context.fettsFirespray.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('Fett\'s Firespray\'s When Played ability should be ready as we control Jango Fett', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#pursuing-the-bounty'],
                    groundArena: ['jango-fett#renowned-bounty-hunter'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    leader: 'chirrut-imwe#one-with-the-force'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fettsFirespray);
            expect(context.fettsFirespray.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('Fett\'s Firespray\'s When Played ability should be ready as we control Boba4 unit as upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fetts-firespray#pursuing-the-bounty', 'boba-fett#feared-bounty-hunter'],
                    spaceArena: ['green-squadron-awing'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    leader: 'chirrut-imwe#one-with-the-force'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFett);
            context.player1.clickPrompt('Play Boba Fett with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            // skip boba ability
            context.player1.clickPrompt('Pass');

            context.player2.passAction();

            context.player1.clickCard(context.fettsFirespray);
            expect(context.fettsFirespray.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('Fett\'s Firespray\'s action ability should exhaust a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jango-fett#renowned-bounty-hunter', 'scout-bike-pursuer'],
                    spaceArena: ['fetts-firespray#pursuing-the-bounty'],
                    resources: 6
                },
                player2: {
                    groundArena: ['battlefield-marine', 'echo-base-defender']
                },
            });

            const { context } = contextRef;

            // exhaust battlefield marine
            context.player1.clickCard(context.fettsFirespray);
            expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Exhaust a non-unique unit']);
            context.player1.clickPrompt('Exhaust a non-unique unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.scoutBikePursuer, context.echoBaseDefender]);
            context.player1.clickCard(context.battlefieldMarine);

            // fett's firespray should not be exhaust and 2 resources was spent
            expect(context.fettsFirespray.exhausted).toBeFalse();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            context.player2.passAction();

            // attack with fett's firespray
            context.player1.clickCard(context.fettsFirespray);
            context.player1.clickPrompt('Attack');
            context.player1.clickCard(context.p2Base);
            expect(context.fettsFirespray.exhausted).toBeTrue();
            context.player2.passAction();

            // we still can do his exhaust action even if he's exhausted
            context.player1.clickCard(context.fettsFirespray);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.scoutBikePursuer, context.echoBaseDefender]);
            context.player1.clickCard(context.scoutBikePursuer);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        it('Fett\'s Firespray\'s action ability should skip targeting if all targets are exhausted, and should not be available as an action if there aren\'t enough resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'fetts-firespray#pursuing-the-bounty', exhausted: true }],
                    resources: 3
                },
                player2: {
                    groundArena: [
                        { card: 'battlefield-marine', exhausted: true },
                        { card: 'echo-base-defender', exhausted: true }
                    ]
                },
            });

            const { context } = contextRef;

            // exhaust battlefield marine
            expect(context.fettsFirespray).toHaveAvailableActionWhenClickedBy(context.player1);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);

            context.player2.passAction();
            expect(context.player1.readyResourceCount).toBe(1);
            expect(context.fettsFirespray).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
