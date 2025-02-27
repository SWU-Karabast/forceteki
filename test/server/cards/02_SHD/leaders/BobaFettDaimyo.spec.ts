describe('Boba Fett, Daimyo', function () {
    integration(function (contextRef) {
        describe('Boba Fett\'s leader ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give +1/+0 to a friendly unit when play a unit with keyword (first unit play)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
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
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.player2).toBeActivePlayer();
            });

            it('should give +1/+0 to a friendly unit when play a unit with keyword (second unit play)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.greenSquadronAwing);
                // play a unit with keyword, should be able to give +1/+0 to a friendly unit
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');
                expect(context.bobaFett.exhausted).toBeFalse();

                // enemy unit is played, nothing should happes
                context.player2.clickCard(context.outerRimHeadhunter);

                // play a unit with keyword, boba is not exhausted, should be able to give +1/+0 to a friendly unit
                context.player1.clickCard(context.cantinaBraggart);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wildernessFighter, context.greenSquadronAwing, context.cantinaBraggart]);
                expect(context.player1).not.toHavePassAbilityButton();

                // boost battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        describe('Boba Fett\'s leader ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable'],
                        leader: 'boba-fett#daimyo',
                        resource: 4
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give +1/+0 to other friendly unit when play a unit which gain a keyword by an ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceXwing);
                // boba triggers as red three give raid 1 to alliance x-wing
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.redThree, context.allianceXwing]);

                // give +1/+0 to battlefield marine, boba should be exhausted
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        describe('Boba Fett\'s leader ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunting-nexu'],
                        groundArena: ['battlefield-marine'],
                        leader: 'boba-fett#daimyo',
                        resource: 4
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not give +1/+0 to other friendly unit when play a unit which does not gain keyword (with conditional keyword)', function () {
                const { context } = contextRef;

                // playing hunting nexu without aggression unit, nothing should happen
                context.player1.clickCard(context.huntingNexu);
                expect(context.player2).toBeActivePlayer();
            });
        });

        // TODO should add tests with timely intervention or ecl

        describe('Boba Fett\'s leader unit ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-three#unstoppable', 'green-squadron-awing'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['heroic-resolve'] }, 'hunting-nexu'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        spaceArena: ['outer-rim-headhunter'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give +1/+0 to other friendly unit with keyword', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.outerRimHeadhunter.getPower()).toBe(1);
                expect(context.bobaFett.getPower()).toBe(4);
                expect(context.huntingNexu.getPower()).toBe(4);

                // attack with heroic resolve, as the unit gain Overwhelm, boba should buff him
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(8);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                context.player2.passAction();

                // playing an aggression unit to activate hunting nexu ability
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeActivePlayer();
                expect(context.huntingNexu.getPower()).toBe(5);
                expect(context.greenSquadronAwing.getPower()).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.redThree);
                expect(context.player2).toBeActivePlayer();

                // red three give raid 1 to all heroism friendly unit
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.outerRimHeadhunter.getPower()).toBe(1);
                expect(context.bobaFett.getPower()).toBe(4);
                expect(context.greenSquadronAwing.getPower()).toBe(2);
                expect(context.huntingNexu.getPower()).toBe(5);
                expect(context.redThree.getPower()).toBe(3);
            });
        });
    });
});
