describe('Evidence of the Crime', function() {
    integration(function(contextRef) {
        describe('Evidence of the Crime\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['evidence-of-the-crime'],
                        groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                        spaceArena: [
                            { card: 'avenger#hunting-star-destroyer', exhausted: true, upgrades: ['frozen-in-carbonite'] },
                            'green-squadron-awing'
                        ],
                        leader: { card: 'boba-fett#daimyo', deployed: true, upgrades: ['grievouss-wheel-bike'] },
                    },
                    player2: {
                        groundArena: [
                            { card: 'atst', exhausted: true },
                            { card: 'isb-agent', upgrades: ['boba-fetts-armor'] },
                            { card: 'frontier-atrt', upgrades: ['smuggling-compartment'] }
                        ],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true, upgrades: ['the-darksaber'] }
                    }
                },
                (context) => {
                    context.p1BobaFettArmor = context.player1.findCardByName('boba-fetts-armor');
                    context.p2BobaFettArmor = context.player2.findCardByName('boba-fetts-armor');
                    context.bobaFettDisintegrator = context.player1.findCardByName('boba-fett#disintegrator');
                    context.bobaFettDaimyo = context.player1.findCardByName('boba-fett#daimyo');
                });
            });

            it('should allow to attach upgrades own by the player to enemy units', function () {
                const { context } = contextRef;

                // Move Boba Fett Armor from player 1 to player 2
                context.player1.clickCard(context.evidenceOfTheCrime);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frozenInCarbonite,
                    context.p1BobaFettArmor,
                    context.p2BobaFettArmor,
                    context.smugglingCompartment
                ]);

                context.player1.clickCard(context.p1BobaFettArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettDisintegrator, context.bobaFettDaimyo, context.isbAgent, context.darthVader]);

                context.player1.clickCard(context.isbAgent);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames([]);
                expect(context.isbAgent).toHaveExactUpgradeNames(['boba-fetts-armor', 'boba-fetts-armor']);

                context.player2.passAction();

                // Move Frozen in Carbonite from player 1 to player 2
                context.player1.moveCard(context.evidenceOfTheCrime, 'hand');
                context.player1.clickCard(context.evidenceOfTheCrime);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frozenInCarbonite,
                    context.p1BobaFettArmor,
                    context.p2BobaFettArmor,
                    context.smugglingCompartment
                ]);

                context.player1.clickCard(context.frozenInCarbonite);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.bobaFettDisintegrator,
                    context.isbAgent,
                    context.avenger,
                    context.greenSquadronAwing,
                    context.atst,
                    context.frontierAtrt,
                    context.cartelSpacer
                ]);

                context.player1.clickCard(context.atst);
                expect(context.avenger).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames(['frozen-in-carbonite']);

                context.moveToNextActionPhase();
                expect(context.avenger.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeTrue();
            });

            it('should allow to attach upgrades own by the player to friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evidenceOfTheCrime);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frozenInCarbonite,
                    context.p1BobaFettArmor,
                    context.p2BobaFettArmor,
                    context.smugglingCompartment
                ]);

                context.player1.clickCard(context.p1BobaFettArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettDisintegrator, context.bobaFettDaimyo, context.isbAgent, context.darthVader]);

                context.player1.clickCard(context.bobaFettDaimyo);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames([]);
                expect(context.bobaFettDaimyo).toHaveExactUpgradeNames(['grievouss-wheel-bike', 'boba-fetts-armor']);

                context.player2.passAction();
            });

            it('should allow to take control of enemy upgrades', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evidenceOfTheCrime);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frozenInCarbonite,
                    context.p1BobaFettArmor,
                    context.p2BobaFettArmor,
                    context.smugglingCompartment
                ]);

                context.player1.clickCard(context.p2BobaFettArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettDisintegrator, context.bobaFettDaimyo, context.isbAgent, context.darthVader]);

                context.player1.clickCard(context.bobaFettDaimyo);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor']);
                expect(context.bobaFettDaimyo).toHaveExactUpgradeNames(['grievouss-wheel-bike', 'boba-fetts-armor']);

                expect(context.player1).toHavePrompt('Choose which copy of Boba Fett\'s Armor to defeat');
                context.player1.clickCard(context.p2BobaFettArmor);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor']);
                expect(context.bobaFettDaimyo).toHaveExactUpgradeNames(['grievouss-wheel-bike']);

                context.player2.passAction();
            });

            it('should be able to move enemy upgrades to friendly units in another arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evidenceOfTheCrime);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frozenInCarbonite,
                    context.p1BobaFettArmor,
                    context.p2BobaFettArmor,
                    context.smugglingCompartment
                ]);

                context.player1.clickCard(context.smugglingCompartment);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.avenger,
                    context.greenSquadronAwing,
                    context.atst,
                    context.frontierAtrt,
                    context.cartelSpacer
                ]);

                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['smuggling-compartment']);
                expect(context.frontierAtrt).toHaveExactUpgradeNames([]);
            });
        });
    });
});
