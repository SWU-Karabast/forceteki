describe('Sabine Wren, Explosives Artist', function() {
    integration(function(contextRef) {
        describe('Sabine', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['protector', 'cloud-city-wing-guard']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should not be targetable when 3 friendly aspects are in play', function () {
                const { context } = contextRef;

                context.player2.setActivePlayer();
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
            });

            it('should be targetable when less than 3 friendly aspects are in play', function () {
                const { context } = contextRef;

                context.player1.setSpaceArenaUnits([]);
                context.player2.setActivePlayer();
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base, context.sabineWren]);
            });

            it('should be targetable if she has sentinel, even with 3 friendly aspects in play', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.protector);
                context.player1.clickCard(context.sabineWren);

                context.player2.passAction();

                context.player1.clickCard(context.cloudCityWingGuard);

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren, context.cloudCityWingGuard]);

                context.player2.clickCard(context.sabineWren);
                expect(context.sabineWren).toBeInZone('discard');
                expect(context.wampa.damage).toBe(3);
            });
        });

        describe('Sabine\'s active ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'modded-cohort'],
                    }
                });
            });

            it('should deal 1 damage to the defender or a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.moddedCohort);

                // case 1: deal damage to defender
                expect(context.player1).toBeAbleToSelectExactly([context.moddedCohort, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.moddedCohort);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.moddedCohort.damage).toBe(3);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);

                context.setDamage(context.sabineWren, 0);
                context.sabineWren.exhausted = false;
                context.setDamage(context.moddedCohort, 0);
                context.player2.passAction();

                // case 2: deal damage to base when attacking unit
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.moddedCohort);
                context.player1.clickCard(context.p2Base);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.moddedCohort.damage).toBe(2);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);

                context.sabineWren.exhausted = false;
                context.setDamage(context.p2Base, 0);
                context.player2.passAction();

                // case 3: deal damage to base when attacking base
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
