describe('Upgrade cards', function() {
    integration(function() {
        describe('When an upgrade is attached', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['foundling'],
                        groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }]
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport'],
                        hand: ['confiscate']
                    }
                });
            });


            it('it should stack bonuses with other applied upgrades', function () {
                this.player1.clickCard(this.foundling);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter, this.brightHope]);
                this.player1.clickCard(this.wampa);

                expect(this.wampa.upgrades).toContain(this.academyTraining);
                expect(this.wampa.upgrades).toContain(this.foundling);
                expect(this.wampa.upgrades.length).toBe(2);
                expect(this.wampa.getPower()).toBe(7);
                expect(this.wampa.getHp()).toBe(8);
            });

            it('its stat bonuses should be correctly applied during combat', function () {
                this.player1.clickCard(this.tielnFighter);
                expect(this.brightHope.damage).toBe(5);
                expect(this.tielnFighter.damage).toBe(2);
            });

            it('and the owner is defeated, the upgrade should also be defeated', function () {
                this.tielnFighter.damage = 3;

                this.player1.clickCard(this.tielnFighter);

                expect(this.brightHope.damage).toBe(5);
                expect(this.tielnFighter).toBeInLocation('discard');
                expect(this.entrenched).toBeInLocation('discard');
            });

            it('and is giving an hp boost keeping the attached unit alive, the attached unit should be defeated when the upgrade is defeated', function () {
                this.tielnFighter.damage = 2;
                this.player1.passAction();

                this.player2.clickCard(this.confiscate);
                this.player2.clickCard(this.entrenched);
                expect(this.entrenched).toBeInLocation('discard');
                expect(this.tielnFighter).toBeInLocation('discard');
            });
        });

        describe('When an upgrade is attached to a leader', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'boba-fett#daimyo', deployed: true, upgrades: ['academy-training'] }
                    },
                    player2: {
                        groundArena: ['atat-suppressor']
                    }
                });
            });

            it('its stat bonuses should be correctly applied during combat', function () {
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.atatSuppressor);
                expect(this.bobaFett).toBeInLocation('ground arena');
                expect(this.bobaFett.damage).toBe(8);
                expect(this.atatSuppressor.damage).toBe(6);
            });
        });

        describe('When an upgrade is attached,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }]
                    },
                    player2: {
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                        hand: ['confiscate']
                    }
                });
            });

            it('its stat bonuses should be correctly applied on top of constant effects modifying stats', function () {
                expect(this.tielnFighter.getPower()).toBe(3);
                expect(this.tielnFighter.getHp()).toBe(2);
            });

            it('and is giving an hp boost keeping the attached unit alive against stat modifying effects, the attached unit should be defeated when the upgrade is defeated', function () {
                this.player1.passAction();

                this.player2.clickCard(this.confiscate);
                expect(this.entrenched).toBeInLocation('discard');
                expect(this.tielnFighter).toBeInLocation('discard');
            });
        });

        describe('When an upgrade is attached', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'first-legion-snowtrooper', upgrades: ['experience'] }, 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['entrenched'],
                        groundArena: [{ card: 'death-trooper', damage: 1 }, 'wampa'],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    }
                });
            });

            it('its stat bonuses should be correctly applied on top of overwhelm and +2/+0 from Snowtrooper ability when attacking.', function () {
                // actions
                this.player1.clickCard(this.firstLegionSnowtrooper);
                expect(this.firstLegionSnowtrooper.getPower()).toBe(3);
                this.player1.clickCard(this.deathTrooper);

                // check board state
                expect(this.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(this.firstLegionSnowtrooper.damage).toBe(3);
                expect(this.p2Base.damage).toBe(8);
                expect(this.player2).toBeActivePlayer();
            });

            it('and a unit is returned to its owner\'s hand, the upgrade should be in the upgrade\'s owner\'s hand', function () {
                this.player1.passAction();
                this.player2.clickCard('entrenched'); // Providing ownership
                this.player2.clickCard(this.pykeSentinel);

                this.player1.clickCard('waylay');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.pykeSentinel, this.deathTrooper, this.firstLegionSnowtrooper]);
                this.player1.clickCard(this.pykeSentinel);

                expect(this.pykeSentinel).toBeInLocation('hand', this.player1);
                expect(this.entrenched).toBeInLocation('discard', this.player2);
            });
        });
    });
});