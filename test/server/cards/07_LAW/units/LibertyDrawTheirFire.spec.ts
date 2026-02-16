describe('Liberty, Draw Their Fire!', function () {
    integration(function (contextRef) {
        describe('Liberty\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['liberty#draw-their-fire'],
                        groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                    },
                    player2: {
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: [{ card: 'wampa', upgrades: ['experience', 'kylo-rens-lightsaber', 'fulcrum'] }, 'battlefield-marine', { card: 'willrow-hood#on-the-run', upgrades: ['protector'] }],
                        spaceArena: [{ card: 'awing', upgrades: ['shield', 'sudden-ferocity'] }, { card: 'green-squadron-awing', upgrades: ['mastery'], exhausted: true }]
                    }
                });
            });

            it('should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberty);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.greenSquadronAwing, context.willrowHood]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.awing.exhausted).toBeTrue();
                expect(context.suddenFerocity).toBeInZone('hand', context.player2);
            });

            it('should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (with an upgrade which cost more than 4)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberty);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.greenSquadronAwing, context.willrowHood]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['fulcrum']);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.kyloRensLightsaber).toBeInZone('hand', context.player2);
            });

            it('should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (Willrow Hood)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberty);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.greenSquadronAwing, context.willrowHood]);
                context.player1.clickCard(context.willrowHood);

                expect(context.player2).toBeActivePlayer();
                expect(context.willrowHood).toHaveExactUpgradeNames(['protector']);
                expect(context.willrowHood.exhausted).toBeTrue();
            });

            it('should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (already exhausted unit)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberty);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.greenSquadronAwing, context.willrowHood]);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
                expect(context.greenSquadronAwing.exhausted).toBeTrue();
                expect(context.mastery).toBeInZone('hand', context.player2);
            });

            it('should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (Pilot upgrade which has different upgrade cost and unit cost)', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.chewbacca);
                context.player2.clickPrompt('Play Chewbacca with Piloting');
                context.player2.clickCard(context.awing);

                context.player1.clickCard(context.liberty);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing, context.greenSquadronAwing, context.willrowHood]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toHaveExactUpgradeNames(['chewbacca#faithful-first-mate']);
                expect(context.awing.exhausted).toBeTrue();
                expect(context.suddenFerocity).toBeInZone('hand', context.player2);
            });
        });

        it('Liberty\'s ability should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (leader upgrade which cost 4 or less)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['liberty#draw-their-fire'],
                },
                player2: {
                    leader: 'major-vonreg#red-baron',
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.majorVonreg);
            context.player2.clickPrompt('Deploy Major Vonreg as a Pilot');
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.liberty);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.awing.exhausted).toBeTrue();
            expect(context.majorVonreg).toBeInZone('base', context.player2);
        });

        it('Liberty\'s ability should exhaust an enemy unit and return every upgrade on it which costs 4 or less to hand (leader upgrade which cost 4 or less)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['liberty#draw-their-fire', 'top-target'],
                },
                player2: {
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.topTarget);
            context.player1.clickCard(context.awing);

            context.player2.passAction();

            context.player1.clickCard(context.liberty);
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.awing.exhausted).toBeTrue();
            expect(context.topTarget).toBeInZone('hand', context.player1);
        });
    });
});