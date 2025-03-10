describe('Biggs Darklighter, they\'ll never stop us', function () {
    integration(function (contextRef) {
        describe('Biggs Darlighter piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['biggs-darklighter#theyll-never-stop-us'],
                        groundArena: [{ card: 'atte-vanguard', damage: 1 }, { card: 'escort-skiff', damage: 2 }],
                        spaceArena: ['landing-shuttle', { card: 'cartel-spacer', damage: 1 }, { card: 'royal-security-fighter', damage: 1 }, 'ruthless-raider'],
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['wing-leader', 'desperado-freighter'],
                    }
                });
            });

            it('gives overwhelm to attached fighter unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.biggsDarklighter);
                context.player1.clickPrompt('Play Biggs Darklighter with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.atteVanguard,
                    context.escortSkiff,
                    context.landingShuttle,
                    context.cartelSpacer,
                    context.royalSecurityFighter,
                    context.ruthlessRaider
                ]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3);
            });

            it('gives +0/+1 to attached transport unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.biggsDarklighter);
                context.player1.clickPrompt('Play Biggs Darklighter with Piloting');
                context.player1.clickCard(context.landingShuttle);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.desperadoFreighter);
                context.player2.clickCard(context.landingShuttle);
                expect(context.desperadoFreighter.damage).toBe(4);
                expect(context.landingShuttle.damage).toBe(5);
                context.player1.passAction();

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.biggsDarklighter);
                expect(context.biggsDarklighter).toBeInZone('discard');
                expect(context.landingShuttle).toBeInZone('discard');
                context.player1.clickPrompt('Pass'); // When defeated drawing landing shuttle ability
            });

            it('gives grit to speeder attached unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.biggsDarklighter);
                context.player1.clickPrompt('Play Biggs Darklighter with Piloting');
                context.player1.clickCard(context.escortSkiff);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // We attack with the escort skiff to test the grit
                expect(context.escortSkiff.damage).toBe(2);
                context.player1.clickCard(context.escortSkiff);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8);

                // We just make sure that the +0/+1 does not apply in that case
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.escortSkiff);
                expect(context.escortSkiff).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('gives nothing when the vehicle is a capital ship', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.biggsDarklighter);
                context.player1.clickPrompt('Play Biggs Darklighter with Piloting');
                context.player1.clickCard(context.ruthlessRaider);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.ruthlessRaider.damage).toBe(2);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
            });

            it('gives nothing when the vehicle is a walker', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.biggsDarklighter);
                context.player1.clickPrompt('Play Biggs Darklighter with Piloting');
                context.player1.clickCard(context.atteVanguard);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.atteVanguard);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.atteVanguard.damage).toBe(4);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.atteVanguard);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8);
            });
        });
    });
});
