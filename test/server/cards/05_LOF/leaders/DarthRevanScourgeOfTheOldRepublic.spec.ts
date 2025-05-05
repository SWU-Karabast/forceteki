describe('Darth Revan, Scourge of the Old Republic', function () {
    integration(function (contextRef) {
        describe('Darth Revan\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'snowspeeder'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'freelance-assassin',
                            'consular-security-force',
                            'wampa'
                        ],
                    },
                });
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should trigger if a friendly unit trades with an enemy unit but have no effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.freelanceAssassin);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.darthRevan.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and does not defeat it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and defeats a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and is defeated by a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.warzoneLieutenant);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit is defeated by an event card effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit which is not the defender is defeated by a friendly unit\'s on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.avenger);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
