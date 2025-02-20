describe('Nebula Ignition', function () {
    integration(function (contextRef) {
        it('Superlaser Blast\' ability should defeat each non-upgraded units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['nebula-ignition'],
                    leader: { card: 'lando-calrissian#with-impeccable-taste', deployed: true },
                    groundArena: [{ card: 'ahsoka-tano#always-ready-for-trouble', upgrades: ['ahsokas-padawan-lightsaber'] }]
                },
                player2: {
                    leader: { card: 'boba-fett#daimyo', upgrades: ['boba-fetts-armor'], deployed: true },
                    groundArena: ['battlefield-marine', { card: 'echo-base-defender', upgrades: ['shield'] }],
                    spaceArena: ['lurking-tie-phantom', { card: 'green-squadron-awing', upgrades: ['perilous-position'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.nebulaIgnition);

            expect(context.player2).toBeActivePlayer();

            expect(context.landoCalrissian.deployed).toBeFalse();

            expect(context.ahsokaTano).toBeInZone('groundArena');
            expect(context.ahsokaTano.isUpgraded()).toBeTrue();

            expect(context.bobaFett.deployed).toBeTrue();
            expect(context.bobaFett.isUpgraded()).toBeTrue();

            expect(context.battlefieldMarine).toBeInZone('discard');

            expect(context.echoBaseDefender).toBeInZone('groundArena');
            expect(context.echoBaseDefender.isUpgraded()).toBeTrue();

            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.isUpgraded()).toBeFalse();

            expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            expect(context.greenSquadronAwing.isUpgraded()).toBeTrue();
        });
    });
});
