describe('Deals Damage Before Defender', function () {
    integration(function (contextRef) {
        describe('Deals Damage Before Defender', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['consular-security-force', 'first-legion-snowtrooper', 'han-solo#reluctant-hero', 'moisture-farmer'],
                    },
                    player2: {
                        groundArena: [{ card: 'r2d2#ignoring-protocol', damage: 1 }, { card: 'scout-bike-pursuer', upgrades: ['experience'] }],
                        base: { card: 'dagobah-swamp', damage: 0 },
                        hand: ['phaseiii-dark-trooper']
                    }
                });
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender and overwhelm damage to base.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.shootFirst);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.firstLegionSnowtrooper, context.hanSolo, context.moistureFarmer]);
                context.player1.clickCard(context.firstLegionSnowtrooper);
                context.player1.clickCard(context.r2d2);

                // check game state
                expect(context.r2d2.location).toBe('discard');
                expect(context.firstLegionSnowtrooper.damage).toBe(0);
                expect(context.shootFirst.location).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender and giving the grit unit its effect before attacker receives damage.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.shootFirst);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.firstLegionSnowtrooper, context.hanSolo, context.moistureFarmer]);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.scoutBikePursuer);

                // check game state
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.scoutBikePursuer.damage).toBe(4);
                expect(context.shootFirst.location).toBe('discard');
            });

            it('Attack should defeat the target before its ability triggers', function() {
                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.moistureFarmer);

                // check board state
                expect(context.moistureFarmer.damage).toBe(3);
                expect(context.phaseiiiDarkTrooper.damage).toBe(1);
                expect(context.phaseiiiDarkTrooper).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});