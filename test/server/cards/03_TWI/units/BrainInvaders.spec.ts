
describe('Brain Invaders', () => {
    integration(function(contextRef) {
        describe('Brain Invaders\'s ability', function() {
            it('does not remove Epic Action abilities from undeployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: 'han-solo#audacious-smuggler'
                    },
                });

                const { context } = contextRef;

                // Clicking Sabine uses her Epic Action
                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deploy Sabine Wren');
                expect(context.sabineWren).toBeInZone('groundArena');

                // Clicking Han Solo uses his Epic Action
                context.player2.clickCard(context.hanSolo);
                context.player2.clickPrompt('Deploy Han Solo');
                expect(context.hanSolo).toBeInZone('groundArena');
            });

            it('removes action abilities from undeployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: 'admiral-trench#chkchkchkchk'
                    },
                });

                const { context } = contextRef;

                // Chancellor Palpatine has no available actions
                expect(context.chancellorPalpatine).not.toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.passAction();

                // Admiral trench has no available actions
                expect(context.admiralTrench).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('removes constant abilities from undeployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#aspiring-to-authority',
                        groundArena: [
                            'brain-invaders',
                            { card: 'doctor-pershing#experimenting-with-life', damage: 1 },
                        ],
                    },
                    player2: {
                        leader: 'nala-se#clone-engineer',
                        base: 'the-crystal-city',
                        hand: ['wrecker#boom']
                    },
                });

                const { context } = contextRef;

                // Krennic's ability does not give Doctor Pershing +1/+0
                expect(context.doctorPershing.getPower()).toBe(0);
                context.player1.passAction();

                // Player 2 cannot ignore Wrecker's aspect penalty with Nala Se
                context.player2.clickCard(context.wrecker);
                context.player2.clickPrompt('Pass');
                expect(context.player2.exhaustedResourceCount).toBe(10);
            });

            it('removes triggered abilities from undeployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        hand: ['crafty-smuggler'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: 'the-mandalorian#sworn-to-the-creed',
                        hand: ['perilous-position']
                    },
                });

                const { context } = contextRef;

                // Player 1 plays an underworld card, Cad Bane's ability does not trigger
                context.player1.clickCard(context.craftySmuggler);
                expect(context.player2).toBeActivePlayer();

                // Player 2 plays an upgrade, The Mandalorian's ability does not trigger
                context.player2.clickCard(context.perilousPosition);
                context.player2.clickCard(context.craftySmuggler);
                expect(context.player1).toBeActivePlayer();
            });

            it('removes action abilities from deployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['sabine-wren#explosives-artist'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                        hand: ['poe-dameron#quick-to-improvise'],
                    },
                });

                const { context } = contextRef;

                // Fennec's only available action is to attack
                context.player1.clickCard(context.fennecShand);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                // Han Solo's only available action is to attack
                context.player2.clickCard(context.hanSolo);
                expect(context.player2).toHavePrompt('Choose a target for attack');
                context.player2.clickCard(context.p1Base);
            });

            it('removes triggered abilities from deployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                        groundArena: [
                            'brain-invaders',
                            'death-star-stormtrooper'
                        ],
                    },
                    player2: {
                        leader: { card: 'obiwan-kenobi#patient-mentor', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', damage: 1 }
                        ]
                    },
                });

                const { context } = contextRef;

                // Attack with Grand Moff Tarkin, his ability does not trigger
                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickCard(context.obiwanKenobi);
                expect(context.player2).toBeActivePlayer();

                // Attack with Obi-Wan Kenobi, his ability does not trigger
                context.player2.clickCard(context.obiwanKenobi);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('removes constant abilities from deployed leaders', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kylo-ren#rash-and-deadly', deployed: true },
                        hand: ['death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: { card: 'admiral-piett#commanding-the-armada', deployed: true },
                        hand: ['relentless#konstantines-folly']
                    },
                });

                const { context } = contextRef;

                // Kylo has 5 power because his constant ability is removed
                expect(context.kyloRen.getPower()).toBe(5);
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                // Piett does not get the Capital Ship discount
                context.player2.clickCard(context.relentlessKonstantinesFolly);
                expect(context.player2.exhaustedResourceCount).toBe(9);
            });

            it('removes all abilities from Piloting leader upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#buying-time',
                        hand: ['direct-hit'],
                        groundArena: ['brain-invaders'],
                        spaceArena: ['razor-crest#reliable-gunship']
                    },
                    player2: {
                        leader: 'rio-durant#wisecracking-wheelman',
                        spaceArena: ['slavers-freighter', 'elite-p38-starfighter']
                    }
                });

                const { context } = contextRef;

                // Deploy Lando as a pilot on the Razor Crest
                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Deploy Lando Calrissian as a Pilot');
                context.player1.clickCard(context.razorCrest);

                // Lando's "When deployed as an upgrade" ability does not trigger
                expect(context.player2).toBeActivePlayer();

                // Elite P-38 can attack base because Razor Crest did not gain Sentinel from Lando
                expect(context.razorCrest.hasSentinel()).toBeFalse();
                context.player2.clickCard(context.eliteP38Starfighter);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);

                // Razor Crest attacks, restoring 2 because it retains its Restore 2
                context.player1.clickCard(context.razorCrest);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(1);

                // Deploy Rio as a pilot on the Slaver's Freighter
                context.player2.clickCard(context.rioDurant);
                context.player2.clickPrompt('Deploy Rio Durant as a Pilot');
                context.player2.clickCard(context.slaversFreighter);

                // Freighter does not get +1/+0 from Rio
                expect(context.slaversFreighter.getPower()).toBe(7);

                // Direct Hit can defeat the Slaver's Freighter because it is not a Leader Unit
                context.player1.clickCard(context.directHit);
                context.player1.clickCard(context.slaversFreighter);
                expect(context.slaversFreighter).toBeInZone('discard');
            });
        });

        describe('When Brain Invaders is removed', function() {
            it('undeployed leaders regain their action abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: 'admiral-trench#chkchkchkchk',
                        hand: ['vanquish'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Chancellor Palpatine regains his action abilities
                expect(context.chancellorPalpatine).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Use it anyway');

                // Admiral Trench regains his action abilities
                expect(context.admiralTrench).toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.clickPrompt('Discard a card that costs 3 or more from your hand');
                context.player2.clickPrompt('Use it anyway');
            });

            it('undeployed leaders regain their constant abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'director-krennic#aspiring-to-authority',
                        groundArena: [
                            'brain-invaders',
                            { card: 'doctor-pershing#experimenting-with-life', damage: 1 },
                        ],
                    },
                    player2: {
                        leader: 'nala-se#clone-engineer',
                        base: 'the-crystal-city',
                        hand: ['wrecker#boom', 'vanquish'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Director Krennic's ability gives Doctor Pershing +1/+0
                expect(context.doctorPershing.getPower()).toBe(1);
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);

                // Nala Se can ignore Wrecker's aspect penalty
                const exhaustedResourceCount = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.wrecker);
                context.player2.clickPrompt('Pass');

                // Wrecker costs 6
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 6);
            });

            it('undeployed leaders regain their triggered abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        hand: ['crafty-smuggler'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: 'the-mandalorian#sworn-to-the-creed',
                        hand: ['the-darksaber', 'vanquish'],
                        groundArena: ['sabine-wren#explosives-artist'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Player 1 plays an underworld card, Cad Bane's ability triggers
                context.player1.clickCard(context.craftySmuggler);
                expect(context.player1).toHavePrompt('Choose an ability to resolve:'); // Choose resolution order
                context.player1.clickPrompt('Exhaust this leader');
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Pass');

                // Player 2 plays an upgrade, The Mandalorian's ability triggers
                context.player2.clickCard(context.theDarksaber);
                context.player2.clickCard(context.sabineWren);
                expect(context.player2).toHavePassAbilityPrompt('Exhaust this leader');
                context.player2.clickPrompt('Pass');
            });

            it('deployed leaders regain their action abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['sabine-wren#explosives-artist'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                        hand: ['vanquish', 'poe-dameron#quick-to-improvise'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Fennec Shand regains her action ability
                expect(context.fennecShand).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toHaveEnabledPromptButton('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                // Han Solo regains his action ability
                expect(context.hanSolo).toHaveAvailableActionWhenClickedBy(context.player2);
                expect(context.player2).toHaveEnabledPromptButton('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
                context.player2.clickPrompt('Attack');
                context.player2.clickCard(context.p1Base);
            });

            it('deployed leaders regain their triggered abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                        groundArena: [
                            'brain-invaders',
                            'death-star-stormtrooper'
                        ],
                    },
                    player2: {
                        leader: { card: 'obiwan-kenobi#patient-mentor', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', damage: 1 }
                        ],
                        hand: ['vanquish'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Attack with Grand Moff Tarkin, his ability triggers
                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickCard(context.obiwanKenobi);
                expect(context.player1).toHavePrompt('Give an experience token to another Imperial unit');
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['experience']);

                // Attack with Obi-Wan Kenobi, his ability triggers
                context.player2.clickCard(context.obiwanKenobi);
                context.player2.clickCard(context.p1Base);
                expect(context.player2).toHavePrompt('Heal 1 damage from a unit');
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(0);

                expect(context.player2).toHavePrompt('Deal 1 damage to a different unit');
                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper.damage).toBe(1);
            });

            it('deployed leaders regain their constant abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kylo-ren#rash-and-deadly', deployed: true },
                        hand: ['death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper'],
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: { card: 'admiral-piett#commanding-the-armada', deployed: true },
                        hand: ['relentless#konstantines-folly', 'vanquish'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Defeat Brain Invaders with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.brainInvaders);

                // Kylo Ren regains his constant ability, getting -3/-0 for the 3 cards in hand
                expect(context.kyloRen.getPower()).toBe(2);
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                // Play a Capital Ship for a discount because Admiral Piett regains his constant ability
                const exhaustedResourceCount = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.relentless);
                expect(context.relentless).toBeInZone('spaceArena');
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 7);
            });

            describe('Interactions with lasting effects and constant abilities', function() {
                beforeEach(function () {
                    return contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'hera-syndulla#spectre-two', deployed: true },
                            base: { card: 'echo-base', damage: 10 },
                            groundArena: ['brain-invaders'],
                            hand: [
                                'in-the-heat-of-battle', // Lasting "gain keyword" effect
                                'pyrrhic-assault', // Lasting "gain triggered ability" effect
                                'home-one#alliance-flagship', // Constant "gain keyword" effect
                                'general-krell#heartless-tactician' // Constant "gain triggered ability" effect
                            ]
                        },
                        player2: {
                            hand: ['vanquish', 'rivals-fall'],
                            groundArena: ['consular-security-force']
                        },
                    });
                });

                it('Lasting "gain keyword" effects applied while Brain Invaders was in play do not apply if it gets removed', function () {
                    const { context } = contextRef;

                    // Player 1 plays In the Heat of Battle, giving all units Sentinel
                    context.player1.clickCard(context.inTheHeatOfBattle);

                    // Brain Invaders is Sentinel but Hera Syndulla is not
                    expect(context.brainInvaders.hasSentinel()).toBeTrue();
                    expect(context.heraSyndulla.hasSentinel()).toBeFalse();

                    // Player 2 plays Vanquish to remove Brain Invaders
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.brainInvaders);

                    // Brain Invaders is removed, Hera Syndulla does not gain Sentinel (she missed the opportunity)
                    expect(context.brainInvaders).toBeInZone('discard');
                    expect(context.heraSyndulla.hasSentinel()).toBeFalse();
                });

                it('Lasting "gain ability" effects applied while Brain Invaders was in play do not apply if it gets removed', function () {
                    const { context } = contextRef;

                    // Player 1 plays Pyrrhic Assault, giving all friendly units a When Defeated ability
                    context.player1.clickCard(context.pyrrhicAssault);

                    // Player 2 plays Vanquish to defeat Brain Invaders
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.brainInvaders);
                    expect(context.brainInvaders).toBeInZone('discard');

                    // When Defeated Ability from Pyrrhic Assault is triggered
                    expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                    context.player1.clickCard(context.consularSecurityForce);
                    expect(context.consularSecurityForce.damage).toBe(2);
                    context.player1.passAction();

                    // Player 2 plays Rivals Fall to defeat Hera Syndulla
                    context.player2.clickCard(context.rivalsFall);
                    context.player2.clickCard(context.heraSyndulla);
                    expect(context.heraSyndulla).toBeInZone('base');

                    // Hera Syndulla does not gain the When Defeated ability from Pyrrhic Assault
                    expect(context.player1).toBeActivePlayer();
                });

                it('Constant "gain keyword" effects applied while Brain Invaders was in play do apply if it gets removed', function () {
                    const { context } = contextRef;

                    // Player 1 plays Home One, giving all friendly units Restore 1
                    context.player1.clickCard(context.homeOne);
                    context.player2.passAction();

                    // Hera Syndulla attacks but does not restore
                    context.player1.clickCard(context.heraSyndulla);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p1Base.damage).toBe(10);

                    // Player 2 plays Vanquish to remove Brain Invaders
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.brainInvaders);

                    context.moveToNextActionPhase();

                    // Hera Syndulla attacks again, now restoring 1 damage
                    context.player1.clickCard(context.heraSyndulla);
                    context.player1.clickCard(context.p2Base);
                    context.player1.clickPrompt('Restore 1'); // Choose resolution order
                    context.player1.clickPrompt('Pass');
                    expect(context.p1Base.damage).toBe(9);
                });

                it('Constant "gain ability" effects applied while Brain Invaders was in play do apply if it gets removed', function () {
                    const { context } = contextRef;

                    // Player 1 plays General Krell, giving all friendly units a When Defeated ability
                    context.player1.clickCard(context.generalKrell);

                    const cardsInHand = context.player1.hand.length;

                    // Player 2 plays Vanquish to defeat Brain Invaders
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.brainInvaders);
                    expect(context.brainInvaders).toBeInZone('discard');

                    // When Defeated Ability gained from General Krell is triggered
                    expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                    context.player1.clickPrompt('Trigger');
                    expect(context.player1.hand.length).toBe(cardsInHand + 1);
                    context.player1.passAction();

                    // Player 2 plays Rivals Fall to defeat Hera Syndulla
                    context.player2.clickCard(context.rivalsFall);
                    context.player2.clickCard(context.heraSyndulla);
                    expect(context.heraSyndulla).toBeInZone('base');

                    // Hera Syndulla gains the When Defeated ability from General Krell
                    expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                    context.player1.clickPrompt('Trigger');
                    expect(context.player1.hand.length).toBe(cardsInHand + 2);
                });
            });
        });
    });
});
