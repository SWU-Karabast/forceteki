describe('Darth Revan, Scourge of the Old Republic', function () {
    integration(function (contextRef) {
        describe('Darth Revan\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'snowspeeder'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'freelance-assassin',
                            'consular-security-force',
                            'wampa'
                        ],
                    },
                });
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should trigger if a friendly unit trades with an enemy unit but have no effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.freelanceAssassin);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthRevan.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and does not defeat it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and defeats a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and is defeated by a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.warzoneLieutenant);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit is defeated by an event card effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit which is not the defender is defeated by a friendly unit\'s on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.avenger);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);

                expect(context.darthRevan.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Darth Revan\'s undeployed ability', function () {
            it('should give an experience to a stolen unit that attacks and defeats an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        hand: ['change-of-heart']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'wampa'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should not throw an exception when triggering for a friendly unit which is now in play as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        groundArena: ['l337#get-out-of-my-seat', 'atst']
                    },
                    player2: {
                        groundArena: ['freelance-assassin']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.freelanceAssassin);

                // trigger L3 ability and attach her to the AT-ST as a pilot
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                // trigger the Revan ability, no game effect and no exception (doesn't try to target L3)
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthRevan.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit using damage from an ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            { card: 'wampa', damage: 4 },
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                // Choose target for attack
                context.player1.clickCard(context.wampa);

                // Choose target for ability
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.sabineWren).toHaveExactUpgradeNames(['experience']);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit using an ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        spaceArena: ['avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.avenger);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickCard(context.cartelSpacer);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.avenger).toHaveExactUpgradeNames(['experience']);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit using a gained ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['twin-laser-turret'], damage: 4 }],
                    },
                    player2: {
                        spaceArena: [{ card: 'imperial-interceptor', damage: 1 }],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.imperialInterceptor);

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['experience', 'twin-laser-turret']);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should not give an experience to a friendly unit that attacks and defeats another enemy unit using an ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        groundArena: ['sabine-wren#you-can-count-on-me'],
                        deck: ['underworld-thug'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', damage: 1 },
                            'wampa',
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                // Choose target for attack
                context.player1.clickCard(context.p2Base);

                // Choose target for ability
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                expect(context.sabineWren).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.darthRevan.exhausted).toBeFalse();
            });
        });

        describe('Darth Revan\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        hand: ['vanquish'],
                        groundArena: ['darth-maul#revenge-at-last']
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'battlefield-marine',
                            'consular-security-force'
                        ],
                    },
                });
            });

            it('should give an experience token to TWI Darth Maul when he attacks two units and defeats only one', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.warzoneLieutenant);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthMaul).toHaveExactUpgradeNames(['experience']);
                expect(context.darthRevan.exhausted).toBe(true);
            });

            it('should only trigger once to give an experience to TWI Darth Maul when he attacks two units and defeats both', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.warzoneLieutenant);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthMaul).toHaveExactUpgradeNames(['experience']);
                expect(context.darthRevan.exhausted).toBe(true);
            });
        });

        describe('Darth Revan\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-revan#scourge-of-the-old-republic', deployed: true },
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'snowspeeder'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'independent-smuggler',
                            'freelance-assassin',
                            'consular-security-force',
                            'wampa'
                        ],
                    },
                });
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);
            });

            it('should give an experience to himself when he attacks and defeats an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthRevan);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthRevan).toHaveExactUpgradeNames(['experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit multiple times in the same phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);

                context.player2.passAction();
                context.readyCard(context.battlefieldMarine);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.independentSmuggler);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.snowspeeder.isUpgraded()).toBe(false);
            });

            it('should not trigger if a friendly unit trades with an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.freelanceAssassin);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and does not defeat it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit attacks an enemy unit and is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and defeats a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit attacks and is defeated by a friendly unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.warzoneLieutenant);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit is defeated by an event card effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if an enemy unit which is not the defender is defeated by a friendly unit\'s on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.avenger);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Darth Revan\'s deployed ability', function () {
            it('should give an experience to a stolen unit that attacks and defeats an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-revan#scourge-of-the-old-republic', deployed: true },
                        hand: ['change-of-heart']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'wampa'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });

            it('should not throw an exception when triggering for a friendly unit which is now in play as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-revan#scourge-of-the-old-republic', deployed: true },
                        groundArena: ['l337#get-out-of-my-seat', 'atst']
                    },
                    player2: {
                        groundArena: ['freelance-assassin']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.freelanceAssassin);

                // trigger L3 ability and attach her to the AT-ST as a pilot
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                // Revan ability doesn't trigger since there would be no effect
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit using an ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-revan#scourge-of-the-old-republic', deployed: true },
                        groundArena: ['sabine-wren#you-can-count-on-me'],
                        deck: ['underworld-thug'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', damage: 1 },
                            'wampa',
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                // Choose target for attack
                context.player1.clickCard(context.battlefieldMarine);

                // Choose target for ability
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Trigger Darth Revan ability
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.sabineWren.damage).toBe(0);
                expect(context.sabineWren).toHaveExactUpgradeNames(['experience']);
                expect(context.battlefieldMarine).toBeInZone('discard');
            });
        });

        describe('Darth Revan\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-revan#scourge-of-the-old-republic', deployed: true },
                        hand: ['vanquish'],
                        groundArena: ['darth-maul#revenge-at-last']
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'battlefield-marine',
                            'consular-security-force'
                        ],
                    },
                });
            });

            it('should give an experience token to TWI Darth Maul when he attacks two units and defeats only one', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.warzoneLieutenant);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit');
                context.player1.clickPrompt('Trigger');

                expect(context.darthMaul).toHaveExactUpgradeNames(['experience']);
            });

            it('should give two experience tokens to TWI Darth Maul when he attacks two units and defeats both', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.warzoneLieutenant);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                // Choose resolution order
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                // TODO: these names are unintuitive, since it names the attack target and not Maul. Need to find a way to improve this
                expect(context.player1).toHaveExactPromptButtons([
                    'Give an Experience token to the attacking unit: Warzone Lieutenant',
                    'Give an Experience token to the attacking unit: Battlefield Marine'
                ]);
                context.player1.clickPrompt('Give an Experience token to the attacking unit: Warzone Lieutenant');

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit: Warzone Lieutenant');
                context.player1.clickPrompt('Trigger');
                expect(context.darthMaul).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacking unit: Battlefield Marine');
                context.player1.clickPrompt('Trigger');
                expect(context.darthMaul).toHaveExactUpgradeNames(['experience', 'experience']);
            });
        });
    });
});
