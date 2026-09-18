describe('Ambush keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'snowspeeder'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['waylay']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('enters play, Ambush allows readying and attacking an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.snowspeeder]);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.syndicateLackeys.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('enters play and there is only one target, Ambush will automatically choose it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.syndicateLackeys.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('enters play and there is no target, the Ambush prompt will not happen', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'syndicate-lackeys']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'snowspeeder'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['waylay']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('enters play after being returned to hand should ready and attack an enemy unit once', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.syndicateLackeys);

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.snowspeeder]);

                context.player1.clickCard(context.snowspeeder);
                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.syndicateLackeys.damage).toBe(3);
                expect(context.snowspeeder.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with Ambush is captured', function() {
            it('it should not trigger ambush when it returns to play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'wampa'],
                        hand: ['sanctioners-shuttle']
                    },
                    player2: {
                        groundArena: ['cloudrider'],
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sanctionersShuttle);
                context.player1.clickCard(context.cloudrider);
                expect(context.cloudrider).toBeCapturedBy(context.sanctionersShuttle);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sanctionersShuttle);
                expect(context.cloudrider).toBeInZone('groundArena');
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('When Ambush triggers nested inside an ongoing attack', function() {
            // Ruling 2026-02-10: an Ambush triggered during an opponent's attack (e.g. tokens created by
            // a defender's When Defeated, entering with Ambush) is nested and resolves within that
            // attack. Because the attack is still ongoing, all "while attacking" abilities — including
            // Raid — remain active on the attacker during the nested ambush.
            xit('resolves the nested ambush within the attack, with the attacker\'s "while attacking" abilities (Raid) still active', function () {
                // Player A controls a stolen Wedge Antilles (friendly Vehicles get +1/+1 and Ambush) and
                // Chimaera (When Defeated: create 2 TIE Fighter tokens) at near-lethal HP. Player B
                // attacks with a Jedi Starfighter (Clone Cohort attached, Raid 2) into Chimaera and uses
                // its On Attack to defeat Chimaera. Player A's 2 TIE tokens enter with Ambush (nested) and
                // ambush into the attacking Jedi Starfighter, which still has its Raid bonus because
                // Player B's attack is still ongoing.
            });
        });
    });
});
