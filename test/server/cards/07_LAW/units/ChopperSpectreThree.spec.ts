describe('Chopper, Spectre Three', function () {
    integration(function (contextRef) {
        it('should give Chopper one Experience token if there are no friendly Vigilance or Cunning Units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chopper#spectre-three'],
                    groundArena: ['warrior-of-clan-ordo', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chopperSpectreThree);

            expect(context.chopperSpectreThree).toHaveExactUpgradeNames(['experience']);
            expect(context.cartelSpacer).not.toHaveExactUpgradeNames(['experience']);
            expect(context.warriorOfClanOrdo).not.toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['experience']);
            expect(context.consularSecurityForce).not.toHaveExactUpgradeNames(['experience']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should give two Experience tokens if there are both friendly Cunning and Vigilance units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chopper#spectre-three'],
                    groundArena: ['consular-security-force'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    groundArena: ['warrior-of-clan-ordo', 'battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chopperSpectreThree);

            expect(context.chopperSpectreThree).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.cartelSpacer).not.toHaveExactUpgradeNames(['experience']);
            expect(context.warriorOfClanOrdo).not.toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['experience']);
            expect(context.consularSecurityForce).not.toHaveExactUpgradeNames(['experience']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should give two experience tokens if there is only a friendly Cunning unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chopper#spectre-three'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: ['warrior-of-clan-ordo', 'battlefield-marine', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chopperSpectreThree);

            expect(context.chopperSpectreThree).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.cartelSpacer).not.toHaveExactUpgradeNames(['experience']);
            expect(context.warriorOfClanOrdo).not.toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['experience']);
            expect(context.consularSecurityForce).not.toHaveExactUpgradeNames(['experience']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should give two experience tokens if there is only a friendly Vigilance unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chopper#spectre-three'],
                    groundArena: ['consular-security-force'],
                },
                player2: {
                    groundArena: ['warrior-of-clan-ordo', 'battlefield-marine'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chopperSpectreThree);

            expect(context.chopperSpectreThree).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.cartelSpacer).not.toHaveExactUpgradeNames(['experience']);
            expect(context.warriorOfClanOrdo).not.toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['experience']);
            expect(context.consularSecurityForce).not.toHaveExactUpgradeNames(['experience']);

            expect(context.player2).toBeActivePlayer();
        });
    });
});