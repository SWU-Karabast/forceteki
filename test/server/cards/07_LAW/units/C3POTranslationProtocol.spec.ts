describe('C-3PO, Translation Protocol', function () {
    integration(function (contextRef) {
        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    groundArena: ['c3po#translation-protocol', { card: 'wampa', upgrades: ['fulcrum'] }, 'populist-advisor', 'mythosaur#folklore-awakened', 'atst'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.populistAdvisor, context.greenSquadronAwing, context.mythosaur, context.wampa, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader (some trait added with upgrade)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, upgrades: ['fulcrum'] },
                    groundArena: ['c3po#translation-protocol', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('should target a unit that shares a trait with a Darksaber-bearing unit (it becomes a leader unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sebulba#especially-dangerous-dug', // Only Fringe trait
                    groundArena: [
                        'c3po#translation-protocol',
                        'the-max-rebo-band#jatzwailers', // Underworld, Musician
                        'battlefield-marine', // Rebel
                        {
                            card: 'max-rebo#encore',    // Underworld, Musician
                            upgrades: ['the-darksaber#icon-of-leadership'] // Makes attached unit a leader unit
                        }
                    ]
                },
                player2: {
                    leader: 'sabine-wren#galvanized-revolutionary' // Mandalorian, Rebel, Spectre
                }
            });

            const { context } = contextRef;

            // Attack with C-3PO
            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            // Ability triggers; Only Max Rebo Band is selectable because it shares its traits with Max Rebo
            expect(context.player1).toHavePrompt('Give an Experience token to another non-leader unit that shares a Trait with a friendly leader');
            expect(context.player1).toBeAbleToSelectExactly([context.theMaxReboBand]);
            context.player1.clickCard(context.theMaxReboBand);

            expect(context.theMaxReboBand).toHaveExactUpgradeNames(['experience']);
        });

        it('C-3PO\'s ability should give an Experience token to another non-leader unit that shares a Trait with a friendly leader (some trait are lost)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    groundArena: ['c3po#translation-protocol', 'yoda#old-master'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['nameless-terror'],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.namelessTerror);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            // yoda is not selectable because luke lost his force trait
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('should count traits from both leaders in Faux Suns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    leader: 'chewbacca#walking-carpet', // Underworld, Wookiee
                    secondLeader: 'darth-vader#dark-lord-of-the-sith', // Force, Imperial, Sith
                    groundArena: [
                        'c3po#translation-protocol',
                        'pyke-sentinel', // Underworld — shares with Chewbacca
                        'death-trooper', // Imperial — shares with Darth Vader
                        'wampa' // Creature — shares with neither leader
                    ]
                },
                player2: {
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.c3po);
            context.player1.clickCard(context.p2Base);

            // Both leaders' traits are pooled: the Underworld unit (Chewbacca) and the Imperial unit
            // (Darth Vader) are both valid; the Creature unit matches neither leader.
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.deathTrooper);

            expect(context.player2).toBeActivePlayer();
            expect(context.deathTrooper).toHaveExactUpgradeNames(['experience']);
        });
    });
});
