describe('Eject', function () {
    integration(function (contextRef) {
        describe('Eject\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'wedge-antilles#leader-of-red-squadron',
                        hand: ['eject'],
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['paige-tico#dropping-the-hammer', 'academy-training'] }],
                        groundArena: ['astromech-pilot', 'snowspeeder', { card: 'blizzard-assault-atat', upgrades: ['determined-recruit'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['independent-smuggler'] }],
                        spaceArena: ['seventh-fleet-defender'],
                        leader: 'darth-vader#victor-squadron-leader'
                    }
                });
            });

            it('should detach a friendly Pilot unit upgrade from a space vehicle and draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                ]);
                context.player1.clickCard(context.paigeTico);

                expect(context.paigeTico).toBeInZone('groundArena');
                expect(context.paigeTico.exhausted).toBeTrue();
                expect(context.allianceXwing).toHaveExactUpgradeNames(['academy-training']);
                expect(context.paigeTico.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });

            it('should detach a friendly Pilot unit upgrade from a ground vehicle and draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                ]);
                context.player1.clickCard(context.determinedRecruit);

                expect(context.determinedRecruit).toBeInZone('groundArena');
                expect(context.determinedRecruit.exhausted).toBeTrue();
                expect(context.blizzardAssaultAtat.isUpgraded()).toBeFalse();
                expect(context.determinedRecruit.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });

            it('should detach an opponent\'s Pilot unit upgrade from a ground vehicle and draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                ]);
                context.player1.clickCard(context.independentSmuggler);

                expect(context.independentSmuggler).toBeInZone('groundArena');
                expect(context.independentSmuggler.exhausted).toBeTrue();
                expect(context.atst.isUpgraded()).toBeFalse();
                expect(context.independentSmuggler.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });

            it('should detach a friendly Pilot leader upgrade attached to a ground vehicle and draw a card', function () {
                const { context } = contextRef;

                // attach Wedge leader as pilot
                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                context.player1.clickCard(context.snowspeeder);

                context.player2.passAction();

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                    context.wedgeAntilles
                ]);
                context.player1.clickCard(context.wedgeAntilles);

                expect(context.wedgeAntilles).toBeInZone('groundArena');
                expect(context.wedgeAntilles.exhausted).toBeTrue();
                expect(context.snowspeeder.isUpgraded()).toBeFalse();
                expect(context.wedgeAntilles.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });

            it('should detach an opponent\'s Pilot leader upgrade attached to a space vehicle and draw a card', function () {
                const { context } = contextRef;

                // attach Vader leader as pilot
                context.player1.passAction();

                context.player2.clickCard(context.darthVader);
                context.player2.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player2.clickCard(context.seventhFleetDefender);

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                    context.darthVader
                ]);
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader).toBeInZone('groundArena');
                expect(context.darthVader.exhausted).toBeTrue();
                expect(context.seventhFleetDefender.isUpgraded()).toBeFalse();
                expect(context.darthVader.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });

            it('should cause units with Piloting abilities to no longer have those abilities', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.paigeTico,
                    context.determinedRecruit,
                    context.independentSmuggler,
                ]);
                context.player1.clickCard(context.paigeTico);

                context.paigeTico.exhausted = false;
                context.player2.passAction();

                // attack with Paige and confirm that her piloting ability doesn't trigger
                context.player1.clickCard(context.paigeTico);
                context.player1.clickCard(context.p2Base);
                expect(context.paigeTico.damage).toBe(0);
                expect(context.paigeTico.isUpgraded()).toBeFalse();
            });
        });
    });
});
