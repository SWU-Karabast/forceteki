describe('Kelleran Beq, The Sabered Hand', function () {
    integration(function (contextRef) {
        it('Kelleran Beq\'s ability should search the top 7 of the deck for a unit and play it for 3 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['kelleran-beq#the-sabered-hand'],
                    deck: ['wampa', 'porg', 'yoda#old-master', 'obiwan-kenobi#following-fate', 'protector', 'the-force-is-with-me', 'force-throw', 'battlefield-marine'],
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kelleranBeq);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.porg, context.yoda, context.obiwanKenobi],
                invalid: [context.protector, context.theForceIsWithMe, context.forceThrow]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.obiwanKenobi);

            expect(context.player2).toBeActivePlayer();
            expect(context.obiwanKenobi).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(10);// 7+(6-3)
            expect([context.wampa, context.porg, context.yoda, context.protector, context.theForceIsWithMe, context.forceThrow]).toAllBeInBottomOfDeck(context.player1, 6);
            expect(context.getChatLog()).toEqual('player1 plays Obi-Wan Kenobi from their deck');
        });

        it('Kelleran Beq\'s ability should search the top 7 of the deck for a unit and play it for 3 resources less (no prompt for pilote)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['kelleran-beq#the-sabered-hand'],
                    spaceArena: ['green-squadron-awing'],
                    deck: ['hopeful-volunteer', 'porg', 'yoda#old-master', 'obiwan-kenobi#following-fate', 'protector', 'the-force-is-with-me', 'force-throw', 'battlefield-marine'],
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kelleranBeq);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.hopefulVolunteer, context.porg, context.yoda, context.obiwanKenobi],
                invalid: [context.protector, context.theForceIsWithMe, context.forceThrow]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.hopefulVolunteer);

            expect(context.player2).toBeActivePlayer();
            expect(context.hopefulVolunteer).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(7);// 7+(2-3)
            expect([context.obiwanKenobi, context.porg, context.yoda, context.protector, context.theForceIsWithMe, context.forceThrow]).toAllBeInBottomOfDeck(context.player1, 6);
        });

        it('with Qui-Gon Jinn\'s Aethersprite\'s effect active, should use Kelleran Beq\'s "When Played" ability again rather than the played unit\'s', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'quigon-jinn#student-of-the-living-force',
                    base: 'echo-base',
                    hand: ['kelleran-beq#the-sabered-hand'],
                    deck: [
                        'latts-razzi#deadly-whipmaster', 'wampa', 'protector', 'rey#skywalker', 'mastery', 'resupply', 'champion',
                        'gungi#finding-himself', 'clan-wren-rescuer', 'awing', 'depa-billaba#a-higher-purpose', 'superlaser-blast', 'fulcrum', 'yoda#old-master'
                    ],
                    spaceArena: ['quigon-jinns-aethersprite#guided-by-the-force'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quigonJinnsAethersprite);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.kelleranBeq);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.rey, context.lattsRazzi],
                invalid: [context.protector, context.mastery, context.champion, context.resupply]
            });
            context.player1.clickCardInDisplayCardPrompt(context.lattsRazzi);

            context.player1.clickPrompt('Give an Experience token to this unit');
            context.player1.clickCard(context.atst);

            expect(context.player1).toHavePassAbilityPrompt('Use that "When Played" ability again');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.gungi, context.clanWrenRescuer, context.awing, context.depaBillaba, context.yoda],
                invalid: [context.fulcrum, context.superlaserBlast]
            });
            context.player1.clickCardInDisplayCardPrompt(context.clanWrenRescuer);

            context.player1.clickCard(context.lattsRazzi);

            expect(context.player2).toBeActivePlayer();
            expect(context.lattsRazzi).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.atst.damage).toBe(3);
            expect(context.lattsRazzi).toBeInZone('groundArena', context.player1);
            expect(context.clanWrenRescuer).toBeInZone('groundArena', context.player1);
            expect(context.kelleranBeq).toBeInZone('groundArena', context.player1);
        });

        it('with Qui-Gon Jinn\'s Aethersprite\'s effect active, should resolve the played unit\'s Ambush before using Kelleran Beq\'s ability again', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kelleran-beq#the-sabered-hand'],
                    deck: [
                        'han-solo#has-his-moments', 'protector', 'mastery', 'resupply', 'champion', 'fulcrum', 'superlaser-blast',
                        'wampa', 'porg', 'repair', 'disarm', 'vanquish', 'waylay', 'tactical-advantage'
                    ],
                    spaceArena: ['quigon-jinns-aethersprite#guided-by-the-force'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quigonJinnsAethersprite);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.kelleranBeq);
            context.player1.clickCardInDisplayCardPrompt(context.hanSolo);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.player1).toHavePassAbilityPrompt('Use that "When Played" ability again');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa, context.porg],
                invalid: [context.repair, context.disarm, context.vanquish, context.waylay, context.tacticalAdvantage]
            });
            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.hanSolo).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
        });
    });
});