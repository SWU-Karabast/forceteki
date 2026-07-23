describe('Jedi General', function() {
    integration(function(contextRef) {
        it('Jedi General\'s ability should create a Clone Token and give an Experience token to it if we control a Republic leader (undeployed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    leader: 'captain-rex#fighting-for-his-brothers'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
        });

        it('Jedi General\'s ability should create a Clone Token and give an Experience token to it if we control a Republic leader (deployed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
        });

        it('Jedi General\'s ability should not create a Clone Token and give an Experience token to it if we do not control a Republic leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    groundArena: ['general-krell#heartless-tactician'],
                    leader: 'chewbacca#walking-carpet'
                },
                player2: {
                    leader: 'captain-rex#fighting-for-his-brothers'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(0);
        });

        it('should count a Darksaber-bearing Republic unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    groundArena: [
                        {
                            card: 'mace-windu#party-crasher', // Has Republic trait
                            upgrades: ['the-darksaber#icon-of-leadership'] // Makes attached unit a leader unit
                        }
                    ],
                    leader: 'chewbacca#walking-carpet' // Underworld, Wookiee
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            // Because Mace is a leader unit, Jedi General's ability triggers to create a Clone Trooper and give it an Experience token
            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should give an Experience token to both Clone Troopers when doubled by Moff Jerjerrod', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');
            expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Clone Trooper tokens instead');
            context.player1.clickPrompt('Trigger');

            const troopers = context.player1.findCardsByName('clone-trooper', 'groundArena');
            expect(context.moffJerjerrod).toBeInZone('discard');
            expect(troopers.length).toBe(2);
            expect(troopers.every((trooper) => trooper.exhausted)).toBeTrue();
            troopers.forEach((trooper) => {
                expect(trooper).toHaveExactUpgradeNames(['experience']);
            });
            expect(context.player2).toBeActivePlayer();
        });

        it('should create a Clone Trooper for each of two Republic leaders in TwinSuns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['jedi-general'],
                    leader: 'captain-rex#fighting-for-his-brothers', // Republic
                    secondLeader: 'padme-amidala#serving-the-republic' // Republic
                },
                player2: {
                    leader: 'chewbacca#walking-carpet'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(2);
            expect(troopers.every((trooper) => trooper.exhausted)).toBeTrue();
            troopers.forEach((trooper) => {
                expect(trooper).toHaveExactUpgradeNames(['experience']);
            });
            expect(context.player2).toBeActivePlayer();
        });

        it('should only count Republic leaders when the two leaders differ in trait in TwinSuns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['jedi-general'],
                    leader: 'captain-rex#fighting-for-his-brothers', // Republic
                    secondLeader: 'chewbacca#walking-carpet' // Underworld, not Republic
                },
                player2: {
                    leader: 'chewbacca#walking-carpet'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should count both Republic leaders and a Darksaber-bearing Republic unit in TwinSuns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['jedi-general'],
                    groundArena: [
                        {
                            card: 'mace-windu#party-crasher', // Republic
                            upgrades: ['the-darksaber#icon-of-leadership'] // Makes attached unit a leader unit
                        }
                    ],
                    leader: 'captain-rex#fighting-for-his-brothers', // Republic
                    secondLeader: 'padme-amidala#serving-the-republic' // Republic
                },
                player2: {
                    leader: 'chewbacca#walking-carpet'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            // Two Republic deck leaders + the Darksaber-borne Republic unit = 3 leaders
            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(3);
            expect(troopers.every((trooper) => trooper.exhausted)).toBeTrue();
            troopers.forEach((trooper) => {
                expect(trooper).toHaveExactUpgradeNames(['experience']);
            });
            expect(context.player2).toBeActivePlayer();
        });
    });
});
