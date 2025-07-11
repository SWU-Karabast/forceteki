describe('Tech, Source of Insight', function () {
    integration(function (contextRef) {
        it('Tech\'s ability should give Smuggle to all cards in the resource zone', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                    base: 'tarkintown',
                    groundArena: ['bendu#the-one-in-the-middle', 'death-trooper'],
                    resources: [
                        'tech#source-of-insight',
                        'wampa',
                        'moment-of-peace',
                        'battlefield-marine',
                        'collections-starhopper',
                        'resilient',
                        'mercenary-company'
                    ]
                },
                player2: {
                    resources: ['isb-agent', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.readyResources(context.player1.resources.length);
                context.player2.passAction();
            };

            // check that Tech ability is off when he's in the resource zone
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);

            // smuggle Tech into play
            context.player1.clickCard(context.tech);
            expect(context.getChatLogs(1)).toContain('player1 plays Tech using Smuggle');

            // check that arena units haven't gained the Smuggle keyword by checking for the Boba buff
            expect(context.deathTrooper.getPower()).toBe(3);

            reset();

            // test smuggle with unit
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player1.resources.length).toBe(7);
            expect(context.getChatLogs(1)).toContain('player1 plays Wampa using Smuggle');

            // check that player2 doesn't gain smuggle
            context.player2.clickCardNonChecking(context.isbAgent);
            expect(context.isbAgent).toBeInZone('resource');

            reset();

            // test that card can't be smuggled if the gained smuggle cost is too expensive
            expect(context.mercenaryCompany).not.toHaveAvailableActionWhenClickedBy(context.player1);

            // test that in-play cards don't gain smuggle somehow
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);

            // test smuggle with off-aspect event (printed cost is 1)
            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context.tech);
            expect(context.tech).toHaveExactUpgradeNames(['shield']);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.player1.resources.length).toBe(7);

            reset();

            // check that the printed smuggle is used since it's lower cost
            context.player1.clickCard(context.collectionsStarhopper);
            expect(context.collectionsStarhopper).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player1.resources.length).toBe(7);

            reset();

            // test smuggle with upgrade
            context.player1.clickCard(context.resilient);
            expect(context.player1).toBeAbleToSelectExactly(
                [context.tech, context.wampa, context.collectionsStarhopper, context.bendu, context.bobaFett, context.deathTrooper]
            );
            context.player1.clickCard(context.collectionsStarhopper);
            expect(context.collectionsStarhopper).toHaveExactUpgradeNames(['resilient']);
            expect(context.player1.resources.length).toBe(7);

            reset();

            // confirm that cost adjusters still work
            context.player1.clickCard(context.bendu);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            context.player1.clickCard(context.mercenaryCompany);
            expect(context.mercenaryCompany).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Tech\'s ability should give Smuggle to all cards in the resource zone and handle alternate costs correctly', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#unparalleled-adversary',
                    base: 'echo-base',
                    groundArena: ['tech#source-of-insight'],
                    resources: ['wampa', 'moment-of-peace', 'battlefield-marine', 'tobias-beckett#i-trust-no-one', 'infiltrating-demolisher', 'atst', 'atst']
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.readyResources(context.player1.resources.length);
                context.player2.passAction();
            };

            // check that the gained smuggle is used since it's the lower cost
            context.player1.clickCard(context.tobiasBeckett);
            expect(context.tobiasBeckett).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player1.resources.length).toBe(7);

            reset();

            // test smuggle + exploit
            context.player1.clickCard(context.infiltratingDemolisher);
            expect(context.player1).toHaveExactPromptButtons(['Play without Exploit', 'Trigger Exploit', 'Cancel']);
            context.player1.clickPrompt('Trigger Exploit');

            expect(context.player1).toBeAbleToSelectExactly([context.tech, context.tobiasBeckett]);
            context.player1.clickCard(context.tobiasBeckett);
            context.player1.clickPrompt('Done');

            expect(context.tobiasBeckett).toBeInZone('discard');
            expect(context.infiltratingDemolisher).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(4); // 4 base cost + 2 from smuggle - 2 from exploit 1
            expect(context.player1.resources.length).toBe(7);
        });

        it('Tech\'s ability should allow to give Smuggle to stolen resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                    base: 'tarkintown',
                    groundArena: ['bendu#the-one-in-the-middle', 'death-trooper', 'tech#source-of-insight'],
                    resources: [
                        'dj#blatant-thief',
                        'wampa',
                        'moment-of-peace',
                        'battlefield-marine',
                        'collections-starhopper',
                        'resilient',
                        'mercenary-company',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                    ]
                },
                player2: {
                    resources: ['daring-raid'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dj);
            expect(context.daringRaid).toBeInZone('resource', context.player1);

            context.player2.passAction();

            expect(context.player1).toBeAbleToSelect(context.daringRaid);

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            expect(context.daringRaid).toBeInZone('discard', context.player2);
            expect(context.p2Base.damage).toBe(2);
        });

        it('should be able to smuggle resupply to add another card to resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'rey#more-than-a-scavenger',
                    base: 'data-vault',
                    deck: ['moisture-farmer'],
                    groundArena: [
                        'tech#source-of-insight'
                    ],
                    resources: [
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'resupply'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resupply);

            expect(context.moistureFarmer).toBeInZone('resource');
            expect(context.resupply).toBeInZone('resource');
            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player1.readyResourceCount).toBe(0);
        });
    });
});
