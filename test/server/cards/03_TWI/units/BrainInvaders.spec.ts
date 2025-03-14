
describe('Brain Invaders', () => {
    integration(function(contextRef) {
        describe('Brain Invaders\'s ability', function() {
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
                expect(context.sabineWren).toBeInZone('groundArena');

                // Clicking Han Solo uses his Epic Action
                context.player2.clickCard(context.hanSolo);
                expect(context.hanSolo).toBeInZone('groundArena');
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
                        groundArena: ['brain-invaders'],
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true }
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
    });
});
