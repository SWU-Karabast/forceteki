describe('Darth Vader, Scourge Of Squadrons', function() {
    integration(function(contextRef) {
        describe('Darth Vader, Scourge Of Squadrons\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: [{ card: 'determined-recruit', upgrades: ['shield'] }],
                        spaceArena: ['alliance-xwing', 'tieln-fighter']
                    }
                });
            });

            it('should deal 1 damage, if a unit is defeated this way it should deal 1 damage to a unit or base', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.allianceXwing);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.tielnFighter);

                // Unit is defeated with ability
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityButton();

                // Vader's ability can deal 1 damage to a unit or base
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit or base');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context.ruthlessRaider, context.allianceXwing, context.determinedRecruit]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage, if that damage does not defeat a unit no extra damage is dealt by the ability', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.tielnFighter);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage, if that damage does not defeat a unit because of a shield no extra damage is dealt by the ability', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.tielnFighter);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.determinedRecruit);

                expect(context.determinedRecruit).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Darth Vader, Scourge Of Squadrons\'s piloting ability, when the 1 damage is fully prevented', function() {
            // Prevented damage is a replacement effect that resolves with no replacement event, so the attached
            // ability has no resolved event to read "willDefeat" from.
            const playVaderAndAttack = (context) => {
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
            };

            it('should not throw or deal extra damage when an enemy ability\'s damage is prevented by Lurking TIE Phantom', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not throw or deal extra damage when the damage is prevented by Umbaran Mobile Cannon (first damage each phase)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: ['umbaran-mobile-cannon']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.umbaranMobileCannon);

                expect(context.umbaranMobileCannon.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not throw or deal extra damage when the damage is reduced to 0 by Numa, Still Fighting', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: ['numa#still-fighting']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.numa);

                expect(context.numa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not throw or deal extra damage when the damage is reduced to 0 by Cassian Andor, Lay Low', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: ['cassian-andor#lay-low']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.cassianAndor);

                expect(context.cassianAndor.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not throw or deal extra damage when the damage is reduced to 0 by Vigil, Securing the Future (on a friendly unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['vigil#securing-the-future'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not throw or deal extra damage when The Mandalorian, Devoted Rescuer defeats a Shield to prevent the damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                playVaderAndAttack(context);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.clickPrompt('Trigger');

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.theMandalorian).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});