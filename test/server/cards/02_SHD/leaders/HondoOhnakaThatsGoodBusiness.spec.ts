describe('Hondo Ohnaka, That\'s Good Business', function () {
    integration(function (contextRef) {
        describe('Hondo Ohnaka\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing'],
                        resources: ['privateer-crew', 'warbird-stowaway', 'pirate-battle-tank', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        groundArena: ['battlefield-marine'],
                        leader: 'hondo-ohnaka#thats-good-business',
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        resources: ['freetown-backup', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    },
                });
            });

            it('should give experience token when play a unit from smuggle (pass on first smuggle played)', function () {
                const { context } = contextRef;

                // play a unit from hand, nothing happen
                context.player1.clickCard(context.allianceXwing);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // play a unit from smuggle
                context.player1.clickCard(context.privateerCrew);

                // choose between 2 triggers
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');

                // do not use hondo ability yet
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
                expect(context.hondoOhnaka.exhausted).toBeFalse();

                // opponent play a unit from smuggle, nothing happen
                context.player2.clickCard(context.freetownBackup);
                expect(context.player1).toBeActivePlayer();

                // play a second unit from smuggle
                context.player1.clickCard(context.warbirdStowaway);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');

                // give experience token to warbird stowaway
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.privateerCrew, context.greenSquadronAwing, context.warbirdStowaway, context.freetownBackup, context.allianceXwing]);
                context.player1.clickCard(context.warbirdStowaway);
                expect(context.warbirdStowaway).toHaveExactUpgradeNames(['experience']);
                expect(context.hondoOhnaka.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // play a third unit from smuggle, nothing happen as hondo is exhausted
                context.player2.passAction();
                context.player1.clickCard(context.pirateBattleTank);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Hondo Ohnaka\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        resources: ['privateer-crew', 'warbird-stowaway', 'pirate-battle-tank', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'hondo-ohnaka#thats-good-business', deployed: true },
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        resources: ['freetown-backup', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    },
                });
            });

            it('should give experience token when play a unit from smuggle', function () {
                const { context } = contextRef;

                // play a unit from hand
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.privateerCrew);

                // choose between 2 triggers
                expect(context.player1).toHaveExactPromptButtons(['Give an experience token to a unit', 'Give 3 experience tokens to this unit']);
                context.player1.clickPrompt('Give an experience token to a unit');

                // give experience token to battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.wampa, context.privateerCrew, context.hondoOhnaka]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                // opponent play a unit from smuggle, nothing happen
                context.player2.clickCard(context.freetownBackup);
                expect(context.player1).toBeActivePlayer();

                // play a second unit from smuggle, add an experience token to warbird stowaway
                context.player1.clickCard(context.warbirdStowaway);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.privateerCrew, context.greenSquadronAwing, context.warbirdStowaway, context.freetownBackup, context.wampa, context.hondoOhnaka]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.warbirdStowaway);
                expect(context.warbirdStowaway).toHaveExactUpgradeNames(['experience']);

                // exhaust hondo
                context.player2.passAction();
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // play a unit from smuggle and give experience
                context.player1.clickCard(context.pirateBattleTank);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.privateerCrew, context.greenSquadronAwing, context.warbirdStowaway, context.freetownBackup, context.wampa, context.hondoOhnaka, context.pirateBattleTank]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.pirateBattleTank);
                expect(context.pirateBattleTank).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
