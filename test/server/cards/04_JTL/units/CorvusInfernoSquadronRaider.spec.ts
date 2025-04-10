describe('Corvus, Inferno Squadron Raider', function() {
    integration(function(contextRef) {
        describe('Corvus\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corvus#inferno-squadron-raider', 'atst'],
                        groundArena: [{ card: 'astromech-pilot', upgrades: ['devotion', 'protector'], damage: 2 }, { card: 'escort-skiff', upgrades: ['sullustan-spacer'] }, 'battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['determined-recruit'], damage: 1 }],
                        base: { card: 'echo-base', damage: 15 },
                        leader: 'major-vonreg#red-baron',
                        resources: 20
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['clone-pilot'], // clone-pilot is a pilot unit
                        spaceArena: [{ card: 'distant-patroller', upgrades: ['hopeful-volunteer'] }], // hopeful-volunteer is a pilot upgrade
                    }
                });
            });

            it('can attach a pilot unit to it when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit, context.sullustanSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.astromechPilot);
                expect(context.corvus).toHaveExactUpgradeNames(['astromech-pilot']);
                expect(context.devotion).toBeInZone('discard');
                expect(context.protector).toBeInZone('discard');
                expect(context.corvus.damage).toBe(0);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['determined-recruit']);
            });

            it('can attach a pilot upgrade to it when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit, context.sullustanSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.determinedRecruit);
                expect(context.corvus).toHaveExactUpgradeNames(['determined-recruit']);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
                expect(context.greenSquadronAwing.damage).toBe(1);
                expect(context.corvus.damage).toBe(0);
            });

            it('can attach a pilot upgrade from a ground vehicle unit to it', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit, context.sullustanSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.sullustanSpacer);
                expect(context.corvus).toHaveExactUpgradeNames(['sullustan-spacer']);
                expect(context.escortSkiff).toHaveExactUpgradeNames([]);
            });

            it('can do nothing when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit, context.sullustanSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.corvus).toHaveExactUpgradeNames([]);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['determined-recruit']);
                expect(context.astromechPilot).toHaveExactUpgradeNames(['devotion', 'protector']);
                expect(context.escortSkiff).toHaveExactUpgradeNames(['sullustan-spacer']);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.corvus);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(13); // restore 2
            });

            it('can attach a pilot from a unit the player does not control', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.escortSkiff);

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([context.astromechPilot, context.determinedRecruit, context.sullustanSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.sullustanSpacer);
                expect(context.corvus).toHaveExactUpgradeNames(['sullustan-spacer']);
                expect(context.escortSkiff).toHaveExactUpgradeNames([]);
                expect(context.escortSkiff).toBeInZone('groundArena', context.player2);
            });

            it('can attach a leader pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player2.passAction();

                expect(context.atst).toBeInZone('groundArena');
                context.player1.clickCard(context.majorVonreg);
                context.player1.clickPrompt('Deploy Major Vonreg as a Pilot');
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['major-vonreg#red-baron']);
                context.player2.passAction();

                context.player1.clickCard(context.corvus);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.astromechPilot,
                    context.determinedRecruit,
                    context.sullustanSpacer,
                    context.majorVonreg
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.majorVonreg);
                expect(context.corvus).toHaveExactUpgradeNames(['major-vonreg#red-baron']);
            });
        });

        describe('Corvus\'s ability with Asajj', function() {
            it('can attach Asajj Ventress as a pilot when she is deployed as a ground unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corvus#inferno-squadron-raider', 'atst'],
                        groundArena: [{ card: 'astromech-pilot', upgrades: ['devotion', 'protector'], damage: 2 }, { card: 'escort-skiff', upgrades: ['sullustan-spacer'] }, 'battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['determined-recruit'], damage: 1 }],
                        base: { card: 'echo-base', damage: 15 },
                        leader: 'asajj-ventress#i-work-alone',
                        resources: 20
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['clone-pilot'],
                        spaceArena: [{ card: 'distant-patroller', upgrades: ['hopeful-volunteer'] }]
                    }
                });

                const { context } = contextRef;

                // Deploy AT-ST first
                context.player1.clickCard('atst');
                context.player2.passAction();

                // Deploy Asajj as a ground unit
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Asajj Ventress', 'Deploy Asajj Ventress as a Pilot',
                    'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.'
                ]);
                context.player1.clickPrompt('Deploy Asajj Ventress');
                expect(context.asajjVentress.deployed).toBe(true);
                expect(context.asajjVentress).toBeInZone('groundArena');
                context.player2.passAction();

                // Play Corvus and try to attach Asajj
                context.player1.clickCard('corvus#inferno-squadron-raider');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.astromechPilot,
                    context.determinedRecruit,
                    context.sullustanSpacer,
                    context.asajjVentress
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.asajjVentress);
                expect(context.corvus).toHaveExactUpgradeNames(['asajj-ventress#i-work-alone']);
            });
        });
    });
});