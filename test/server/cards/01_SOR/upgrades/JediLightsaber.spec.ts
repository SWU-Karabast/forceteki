describe('Jedi Lightsaber', function() {
    integration(function(contextRef) {
        describe('Jedi Lightsaber\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'grogu#irresistible', upgrades: ['jedi-lightsaber'] }],
                    },
                    player2: {
                        groundArena: ['atst', 'wampa', 'specforce-soldier'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give -2/-2 to the defender when attached to a Force unit', function () {
                const { context } = contextRef;

                // CASE 1: defender survives
                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.atst);

                expect(context.grogu.damage).toBe(4);
                expect(context.grogu.exhausted).toBe(true);
                expect(context.atst.damage).toBe(3);
                expect(context.atst.getPower()).toBe(4);
                expect(context.atst.getHp()).toBe(5);
                expect(context.atst.remainingHp).toBe(2);

                // CASE 1.1: unit with -2/-2 does an attack to confirm its stats
                context.setDamage(context.grogu, 0);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.grogu);
                expect(context.grogu.damage).toBe(4);
                expect(context.atst).toBeInZone('discard');

                // CASE 2: defender dies from combined attack damage and hp effect
                context.grogu.exhausted = false;
                context.setDamage(context.grogu, 0);
                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.wampa);

                expect(context.grogu.damage).toBe(2);
                expect(context.grogu.exhausted).toBe(true);
                expect(context.wampa).toBeInZone('discard');

                // CASE 3: defender dies from hp effect before attack resolves
                context.player2.passAction();
                context.grogu.exhausted = false;
                context.setDamage(context.grogu, 0);
                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.specforceSoldier);

                expect(context.grogu.damage).toBe(0);
                expect(context.grogu.exhausted).toBe(true);
                expect(context.specforceSoldier).toBeInZone('discard');

                // CASE 4: no effect when attacking a base
                context.player2.passAction();
                context.grogu.exhausted = false;
                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Attack');

                expect(context.p2Base.getHp()).toBe(30);
            });
        });

        describe('Jedi Lightsaber\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['jedi-lightsaber'] }],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should not do anything when not attached to a Force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.battlefieldMarine.damage).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(true);
            });
        });

        describe('Jedi Lightsaber', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jedi-lightsaber'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },
                    player2: {
                    }
                });
            });

            it('should not be playable on vehicles', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jediLightsaber);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber']);
            });
        });
    });
});
