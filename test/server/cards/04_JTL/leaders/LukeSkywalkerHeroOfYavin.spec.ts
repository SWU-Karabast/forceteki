
describe('Luke Skywalker, Hero of Yavin', function() {
    integration(function(contextRef) {
        describe('Luke Skywalker, Hero of Yavin\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        spaceArena: ['alliance-xwing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['rivals-fall', 'confiscate', 'bamboozle']
                    }
                });
            });

            it('should allow him to exhaust to deal 1 damage to a unit as a fighter attacked during that phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('If you attacked with a Fighter unit this phase, deal 1 damage to a unit');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.allianceXwing, context.battlefieldMarine, context.cartelSpacer]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(1);
                expect(context.lukeSkywalker.exhausted).toBe(true);
            });

            it('should allow him to exhaust but deal no damage as no friendly Fighter unit attacked this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('If you attacked with a Fighter unit this phase, deal 1 damage to a unit');
                context.player1.clickPrompt('Use it anyway');

                expect(context.lukeSkywalker.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Luke Skywalker, Hero of Yavin\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        spaceArena: ['alliance-xwing', 'munificent-frigate', 'mercenary-gunship'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }],
                        hand: ['power-failure']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['rivals-fall', 'confiscate', 'bamboozle', 'vanquish', 'aggression']
                    }
                });
            });

            it('should deploy as a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker');

                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deploy as a pilot upgrade and attached Fighter unit gains On Attack: You may deal 3 damage to a unit', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Player 1 attacks with Alliance X-Wing
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.allianceXwing, context.battlefieldMarine, context.cartelSpacer, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deploy as a pilot upgrade and attached unit is not Fighter and should not gain On Attack ability', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.munificentFrigate);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.munificentFrigate).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Player 1 attacks with Munificent Frigate no On Attack ability
                context.player1.clickCard(context.munificentFrigate);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deploy as a pilot upgrade and attached unit can be defeated', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                // Player 2 defeats Luke Skywalker as a unit
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.lukeSkywalker).toBeInZone('base');
                expect(context.lukeSkywalker.exhausted).toBe(true);
                expect(context.lukeSkywalker.deployed).toBe(false);
            });

            it('should deploy as a pilot upgrade and attached unit is a leader unit', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                // Alliance X-Wing is now a leader unit
                context.player2.clickCard(context.vanquish);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.munificentFrigate, context.cartelSpacer, context.wampa, context.mercenaryGunship]);
                context.player2.clickCard(context.munificentFrigate);
            });

            it('should deploy as a pilot upgrade and cannot be defeated as an upgrade by enemy cards abilities', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                // Player 2 cannot defeat Luke Skywalker as an upgrade
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.player1).toBeActivePlayer();
            });

            it('should deploy as a pilot upgrade and cannot be defeated as an upgrade by enemy cards abilities aggression', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                const defeatPrompt = 'Defeat up to 2 upgrades';
                const damagePrompt = 'Deal 4 damage to a unit';

                // Player 2 can select to defeat Luke Skywalker as an upgrade but the effect will be prevented
                context.player2.clickCard(context.aggression);

                context.player2.clickPrompt(defeatPrompt);
                context.player2.clickCard(context.lukeSkywalker);
                context.player2.clickDone();

                context.player2.clickPrompt(damagePrompt);
                context.player2.clickCard(context.wampa);

                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.damage).toBe(4);
            });

            it('should deploy as a pilot upgrade and can be defeated as an upgrade by friendly abilities', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                // Player 1 can defeat Luke Skywalker as an upgrade
                context.player2.passAction();
                context.player1.clickCard(context.powerFailure);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickDone();

                expect(context.lukeSkywalker).toBeInZone('base');
                expect(context.player2).toBeActivePlayer();
            });

            it('should deploy as a pilot upgrade and can be defeated as an upgrade with bamboozle', function () {
                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Luke Skywalker', 'Deploy Luke Skywalker as a Pilot', 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit']);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.munificentFrigate, context.mercenaryGunship]);
                context.player1.clickCard(context.allianceXwing);

                // Assert Luke Skywalker is deployed as a pilot upgrade
                expect(context.lukeSkywalker.deployed).toBe(true);
                expect(context.lukeSkywalker).toBeInZone('spaceArena');
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(8);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['luke-skywalker#hero-of-yavin']);
                expect(context.player2).toBeActivePlayer();

                // Player 2 can defeat Luke Skywalker as an upgrade with bamboozle
                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.allianceXwing);

                expect(context.lukeSkywalker).toBeInZone('base');
                expect(context.allianceXwing.isUpgraded()).toBe(false);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});