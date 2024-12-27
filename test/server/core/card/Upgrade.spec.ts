describe('Upgrade cards', function() {
    integration(function(contextRef) {
        describe('When an upgrade is attached', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['foundling'],
                        groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }]
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport'],
                        hand: ['confiscate']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });


            it('it should stack bonuses with other applied upgrades', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.foundling);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter, context.brightHope]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.upgrades).toContain(context.academyTraining);
                expect(context.wampa.upgrades).toContain(context.foundling);
                expect(context.wampa.upgrades.length).toBe(2);
                expect(context.wampa.getPower()).toBe(7);
                expect(context.wampa.getHp()).toBe(8);
            });

            it('its stat bonuses should be correctly applied during combat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);
                expect(context.brightHope.damage).toBe(5);
                expect(context.tielnFighter.damage).toBe(2);
            });

            it('and the owner is defeated, the upgrade should also be defeated', function () {
                const { context } = contextRef;

                context.setDamage(context.tielnFighter, 3);

                context.player1.clickCard(context.tielnFighter);

                expect(context.brightHope.damage).toBe(5);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.entrenched).toBeInZone('discard');
            });

            it('and is giving an hp boost keeping the attached unit alive, the attached unit should be defeated when the upgrade is defeated', function () {
                const { context } = contextRef;

                context.setDamage(context.tielnFighter, 2);
                context.player1.passAction();

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.entrenched);
                expect(context.entrenched).toBeInZone('discard');
                expect(context.tielnFighter).toBeInZone('discard');
            });
        });

        describe('When an upgrade is attached to a leader', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'boba-fett#daimyo', deployed: true, upgrades: ['academy-training'] }
                    },
                    player2: {
                        groundArena: ['atat-suppressor']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('its stat bonuses should be correctly applied during combat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.bobaFett).toBeInZone('groundArena');
                expect(context.bobaFett.damage).toBe(8);
                expect(context.atatSuppressor.damage).toBe(6);
            });
        });

        describe('When an upgrade is attached,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }]
                    },
                    player2: {
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                        hand: ['confiscate']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('its stat bonuses should be correctly applied on top of constant effects modifying stats', function () {
                const { context } = contextRef;

                expect(context.tielnFighter.getPower()).toBe(3);
                expect(context.tielnFighter.getHp()).toBe(2);
            });

            it('and is giving an hp boost keeping the attached unit alive against stat modifying effects, the attached unit should be defeated when the upgrade is defeated', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.confiscate);
                expect(context.entrenched).toBeInZone('discard');
                expect(context.tielnFighter).toBeInZone('discard');
            });
        });

        describe('When an upgrade is attached', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'first-legion-snowtrooper', upgrades: ['experience'] }, 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['entrenched'],
                        groundArena: [{ card: 'death-trooper', damage: 1 }, 'wampa'],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('its stat bonuses should be correctly applied on top of overwhelm and +2/+0 from Snowtrooper ability when attacking.', function () {
                const { context } = contextRef;

                // actions
                context.player1.clickCard(context.firstLegionSnowtrooper);
                expect(context.firstLegionSnowtrooper.getPower()).toBe(3);
                context.player1.clickCard(context.deathTrooper);

                // check board state
                expect(context.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(context.firstLegionSnowtrooper.damage).toBe(3);
                expect(context.p2Base.damage).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });

            it('and a unit is returned to its owner\'s hand, the upgrade should be in the upgrade\'s owner\'s discard pile', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard('entrenched'); // Providing ownership
                context.player2.clickCard(context.pykeSentinel);

                context.player1.clickCard('waylay');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.deathTrooper, context.firstLegionSnowtrooper]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.entrenched).toBeInZone('discard', context.player2);
            });
        });
    });
});