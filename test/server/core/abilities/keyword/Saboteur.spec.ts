describe('Saboteur keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Saboteur keyword attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['resourceful-pursuers']
                    },
                    player2: {
                        groundArena: ['echo-base-defender',
                            { card: 'wampa', upgrades: ['shield', 'shield', 'resilient'] }
                        ],
                        spaceArena: ['system-patrol-craft'],
                        hand: ['waylay']
                    },
                });
            });

            it('it may bypass Sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.resourcefulPursuers);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.resourcefulPursuers.damage).toBe(0);
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.wampa.zoneName).toBe('groundArena');
            });

            it('after it was removed from play and played again it shouldn\'t cause an error', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.resourcefulPursuers);
                context.player1.clickCard(context.resourcefulPursuers);


                context.readyCard(context.resourcefulPursuers);
                context.player2.passAction();

                // see if everything goes normally
                context.player1.clickCard(context.resourcefulPursuers);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.resourcefulPursuers.damage).toBe(0);
            });

            it('a unit with shields, the shields are defeated before the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.resourcefulPursuers);
                context.player1.clickCard(context.wampa);
                expect(context.resourcefulPursuers.damage).toBe(4);
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.wampa.damage).toBe(5);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa).toHaveExactUpgradeNames(['resilient']);
            });
        });

        describe('When a unit with Saboteur keyword attacks on another arena', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['breaking-in'],
                        spaceArena: ['strafing-gunship'],
                        groundArena: ['retrofitted-airspeeder']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['awing', 'bright-hope#narrow-escape'],
                    },
                });
            });

            it('it may bypass all sentinel (attack from space)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.breakingIn);
                context.player1.clickCard(context.strafingGunship);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender, context.battlefieldMarine, context.awing, context.brightHope]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.strafingGunship.damage).toBe(1);
            });

            it('it may bypass all sentinel (attack from ground)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.breakingIn);
                context.player1.clickCard(context.retrofittedAirspeeder);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender, context.battlefieldMarine, context.awing, context.brightHope]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard');
                expect(context.retrofittedAirspeeder.damage).toBe(1);
            });
        });
    });
});
