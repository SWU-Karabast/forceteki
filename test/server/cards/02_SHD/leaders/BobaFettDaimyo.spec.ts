describe('Boba Fett, Daimyo', function () {
    integration(function (contextRef) {
        describe('Boba Fett\'s leader ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['green-squadron-awing', 'cantina-braggart'],
                        groundArena: ['wilderness-fighter', 'battlefield-marine'],
                        leader: 'boba-fett#daimyo',
                        resources: 4,
                    },
                    player2: {
                        hand: ['outer-rim-headhunter'],
                        groundArena: ['wampa'],
                    },
                });
            });

            it('should give +1/+0 to a friendly unit when play a unit with keyword (first unit play)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toHavePrompt('Choose a friendly to give +1/+0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter, context.greenSquadronAwing]);

                // give +1/+0 to battlefield marine, boba should be exhausted
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                // enemy unit played, nothing should happen
                context.player2.clickCard(context.outerRimHeadhunter);

                // boba exhausted, nothing should happen while playing a unit with keyword
                context.player1.clickCard(context.cantinaBraggart);
                expect(context.player1).not.toHavePrompt('Choose a friendly to give +1/+0 for this phase');
                expect(context.player2).toBeActivePlayer();
            });

            it('should give +1/+0 to a friendly unit when play a unit with keyword (second unit play)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.greenSquadronAwing);
                // play a unit with keyword, should be able to give +1/+0 to a friendly unit
                expect(context.player1).toHavePrompt('Choose a friendly to give +1/+0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter, context.greenSquadronAwing]);
                context.player1.clickPrompt('Pass ability');
                expect(context.bobaFett.exhausted).toBeFalse();

                // enemy unit is played, nothing should happes
                context.player2.clickCard(context.outerRimHeadhunter);

                // play a unit with keyword, boba is not exhausted, should be able to give +1/+0 to a friendly unit
                context.player1.clickCard(context.cantinaBraggart);
                expect(context.player1).toHavePrompt('Choose a friendly to give +1/+0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter, context.greenSquadronAwing, context.cantinaBraggart]);

                // boost battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        describe('Boba Fett\'s leader ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable'],
                        leader: 'boba-fett#daimyo',
                        resource: 4
                    },
                    player2: {}
                });
            });

            it('should give +1/+0 to other friendly unit when play a unit which gain a keyword by an ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceXwing);
                // boba triggers as red three give raid 1 to alliance x-wing
                expect(context.player1).toHavePrompt('Choose a friendly to give +1/+0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.redThree, context.allianceXwing]);

                // give +1/+0 to battlefield marine, boba should be exhausted
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        // TODO should add tests with timely intervention or ecl

        describe('Boba Fett\'s leader unit ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['red-three#unstoppable'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        spaceArena: ['outer-rim-headhunter'],
                    }
                });
            });

            it('should give +1/+0 to other friendly unit with keyword', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.outerRimHeadhunter.getPower()).toBe(1);
                expect(context.bobaFett.getPower()).toBe(4);
                expect(context.greenSquadronAwing.getPower()).toBe(2);

                context.player1.clickCard(context.redThree);
                expect(context.player2).toBeActivePlayer();

                // red three give raid 1 to all heroism friendly unit
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.outerRimHeadhunter.getPower()).toBe(1);
                expect(context.bobaFett.getPower()).toBe(4);
                expect(context.greenSquadronAwing.getPower()).toBe(2);
                expect(context.redThree.getPower()).toBe(3);
            });
        });
    });
});
