describe('Jedi Lightsaber', function() {
    integration(function() {
        describe('Jedi Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                // CASE 1: defender survives
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Attack');
                this.player1.clickCard(this.atst);

                expect(this.grogu.damage).toBe(4);
                expect(this.grogu.exhausted).toBe(true);
                expect(this.atst.damage).toBe(3);
                expect(this.atst.getPower()).toBe(4);
                expect(this.atst.getHp()).toBe(5);
                expect(this.atst.remainingHp).toBe(2);

                // CASE 1.1: unit with -2/-2 does an attack to confirm its stats
                this.grogu.damage = 0;
                this.player2.clickCard(this.atst);
                this.player2.clickCard(this.grogu);
                expect(this.grogu.damage).toBe(4);
                expect(this.atst).toBeInLocation('discard');

                // CASE 2: defender dies from combined attack damage and hp effect
                this.grogu.exhausted = false;
                this.grogu.damage = 0;
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Attack');
                this.player1.clickCard(this.wampa);

                expect(this.grogu.damage).toBe(2);
                expect(this.grogu.exhausted).toBe(true);
                expect(this.wampa).toBeInLocation('discard');

                // CASE 3: defender dies from hp effect before attack resolves
                this.player2.passAction();
                this.grogu.exhausted = false;
                this.grogu.damage = 0;
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Attack');
                this.player1.clickCard(this.specforceSoldier);

                expect(this.grogu.damage).toBe(0);
                expect(this.grogu.exhausted).toBe(true);
                expect(this.specforceSoldier).toBeInLocation('discard');

                // CASE 4: no effect when attacking a base
                this.player2.passAction();
                this.grogu.exhausted = false;
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Attack');

                expect(this.p2Base.getHp()).toBe(30);
            });
        });

        describe('Jedi Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.consularSecurityForce);

                expect(this.consularSecurityForce.getPower()).toBe(3);
                expect(this.consularSecurityForce.getHp()).toBe(7);
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.battlefieldMarine.damage).toBe(3);
                expect(this.battlefieldMarine.exhausted).toBe(true);
            });
        });

        describe('Jedi Lightsaber', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.jediLightsaber);
                expect(this.battlefieldMarine.upgrades).toContain(this.jediLightsaber);
            });
        });
    });
});
