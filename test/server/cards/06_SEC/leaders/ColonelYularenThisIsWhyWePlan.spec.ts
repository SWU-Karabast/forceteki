describe('Colonel Yularen, This Is Why We Plan', function() {
    integration(function(contextRef) {
        const disclosePrompt = 'Disclose Command, Heroism to attack with another unit';
        describe('Colonel Yularen\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'sabine-wren#explosives-artist', 'death-trooper', { card: 'seasoned-shoretrooper', exhausted: true }],
                        spaceArena: ['tieln-fighter', 'seventh-fleet-defender'],
                        leader: 'colonel-yularen#this-is-why-we-plan'
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['tie-advanced']
                    },
                });
            });

            it('should attack with two units, the second costs less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickPrompt('Attack with a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.sabineWrenExplosivesArtist, context.deathTrooper, context.tielnFighter, context.seventhFleetDefender]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.seventhFleetDefender);
                context.player1.clickCard(context.p2Base);
                expect(context.seventhFleetDefender.exhausted).toBe(true);

                // second attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWrenExplosivesArtist, context.tielnFighter]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.tielnFighter);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.p2Base);
                expect(context.tielnFighter.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
                expect(context.colonelYularenThisIsWhyWePlan.exhausted).toBe(true);
            });

            it('should allow passing the second attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickPrompt('Attack with a unit');

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                // second attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWrenExplosivesArtist, context.deathTrooper, context.tielnFighter, context.seventhFleetDefender]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.colonelYularenThisIsWhyWePlan.exhausted).toBe(true);
            });

            it('should allow appropriate attack triggers to happen when either attack is declared', function () {
                const { context } = contextRef;

                // unit with trigger first
                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickPrompt('Attack with a unit');
                context.player1.clickCard(context.sabineWrenExplosivesArtist);
                context.player1.clickCard(context.sundariPeacekeeper);

                // being prompted for Sabine trigger target
                expect(context.sabineWren.damage).toBe(0);
                expect(context.sundariPeacekeeper.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // trigger and attack go through
                expect(context.p2Base.damage).toBe(1);
                expect(context.sabineWren.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(2);

                // second attack
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // unit with trigger second
                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickPrompt('Attack with a unit');
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                // second attack
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWrenExplosivesArtist, context.deathTrooper, context.tielnFighter, context.seventhFleetDefender, context.seasonedShoretrooper]);
                context.player1.clickCard(context.sabineWrenExplosivesArtist);
                context.player1.clickCard(context.sundariPeacekeeper);

                // being prompted for Sabine trigger target
                expect(context.sabineWren.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });
        });

        describe('Colonel Yularen\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'colonel-yularen#this-is-why-we-plan'
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['tie-advanced']
                    },
                });
            });

            it('can be activated with no target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickPrompt('Attack with a unit');
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Colonel Yularen\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['atst', 'sabine-wren#explosives-artist', 'death-trooper', { card: 'seasoned-shoretrooper', exhausted: true }, 'ahsoka-tano#i-learned-it-from-you'],
                        spaceArena: ['tieln-fighter', 'seventh-fleet-defender'],
                        leader: { card: 'colonel-yularen#this-is-why-we-plan', deployed: true }
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'reinforcement-walker'],
                        spaceArena: ['tie-advanced']
                    },
                });
            });

            it('should allow attacking with another unit that costs 4 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.colonelYularenThisIsWhyWePlan.exhausted).toBe(true);
                expect(context.colonelYularenThisIsWhyWePlan.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);

                expect(context.player1).toBeAbleToSelectExactly([context.sabineWrenExplosivesArtist, context.deathTrooper, context.tielnFighter, context.seventhFleetDefender, context.ahsokaTanoILearnedItFromYou]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.deathTrooper);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.p2Base);
                expect(context.deathTrooper.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(3);
                expect(context.deathTrooper.damage).toBe(0);
            });

            it('should allow passing the second attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickCard(context.p2Base);
                expect(context.colonelYularenThisIsWhyWePlan.exhausted).toBe(true);

                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if there is no legal target', function () {
                const { context } = contextRef;

                context.exhaustCard(context.sabineWrenExplosivesArtist);
                context.exhaustCard(context.tielnFighter);
                context.exhaustCard(context.seventhFleetDefender);
                context.exhaustCard(context.deathTrooper);
                context.exhaustCard(context.ahsokaTanoILearnedItFromYou);
                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickCard(context.p2Base);
                expect(context.colonelYularenThisIsWhyWePlan.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if Yularen dies during the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.colonelYularenThisIsWhyWePlan).toBeInZone('base');
                expect(context.reinforcementWalker.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should stack with Ahsoka Tano', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTanoILearnedItFromYou);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                ]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.clickPrompt('Done');

                context.player1.clickCard(context.colonelYularenThisIsWhyWePlan);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(9);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});