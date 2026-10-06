describe('DJ, Blatant Thief', function() {
    integration(function(contextRef) {
        describe('DJ\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['strafing-gunship'],
                        // 10 resources total
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        groundArena: ['atat-suppressor'],
                        resources: 10
                    }
                });
            });

            it('should take control of a resource until he leaves play, taking a ready resource if available', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.djBlatantThief);

                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2.readyResourceCount).toBe(9);
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.getChatLogs(2)).toContain(
                    'player1 uses DJ to take control of a resource from player2 and then to apply a delayed effect'
                );

                // check that stolen resource maintained its ready state
                const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                expect(stolenResourceList.length).toBe(1);
                const stolenResource = stolenResourceList[0];
                expect(stolenResource.exhausted).toBeFalse();

                // confirm that player1 can spend with it
                context.player2.passAction();
                expect(context.player1.readyResourceCount).toBe(4);
                context.player1.clickCard(context.strafingGunship);
                expect(context.strafingGunship).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(11);
                expect(stolenResource.exhausted).toBeTrue();

                // DJ is defeated, resource goes back to owner's resource zone and stays exhausted
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player2.readyResourceCount).toBe(9);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.player1.readyResourceCount).toBe(0);

                expect(stolenResource.controller).toBe(context.player2Object);
                expect(stolenResource.exhausted).toBeTrue();
            });

            it('should take control of a resource until he leaves play, taking an exhausted resource if required', function () {
                const { context } = contextRef;

                context.player2.exhaustResources(10);

                context.player1.clickCard(context.djBlatantThief);

                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.player2.readyResourceCount).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(9);

                // check that stolen resource maintained its ready state
                const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                expect(stolenResourceList.length).toBe(1);
                const stolenResource = stolenResourceList[0];
                expect(stolenResource.exhausted).toBeTrue();

                // move to next action phase so that resources are all readied
                context.moveToNextActionPhase();

                // DJ is defeated, resource goes back to owner's resource zone and stays ready
                context.player1.passAction();
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2.readyResourceCount).toBe(10);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.readyResourceCount).toBe(10);

                expect(stolenResource.controller).toBe(context.player2Object);
                expect(stolenResource.exhausted).toBeFalse();
            });
        });

        it('DJ\'s when played ability should do nothing if he is played from hand or discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    hand: ['dj#blatant-thief', 'palpatines-return'],
                    resources: 20
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.djBlatantThief);
            expect(context.player1.resources.length).toBe(20);
            expect(context.player2.resources.length).toBe(20);

            // defeat DJ and play him from discard
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.dj);
            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.dj);

            expect(context.player1.resources.length).toBe(20);
            expect(context.player2.resources.length).toBe(20);
        });

        it('DJ\'s when played ability should work when cloned by Clone', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'echo-base',
                    leader: 'han-solo#audacious-smuggler',
                    hand: ['battlefield-marine'],
                    groundArena: ['dj#blatant-thief', 'tech#source-of-insight'],
                    // 10 resources total
                    resources: [
                        'clone', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            // Play Clone for 9 resources
            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.djBlatantThief);

            // Clone-DJ steals a ready resource from Player 2, putting P1 to 2 ready resources
            expect(context.player1.resources.length).toBe(11);
            expect(context.player1.readyResourceCount).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(9);

            expect(context.player2.resources.length).toBe(9);
            expect(context.player2.readyResourceCount).toBe(9);
            expect(context.player2.exhaustedResourceCount).toBe(0);
            expect(context.getChatLogs(2)).toContain(
                'player1 uses DJ to take control of a resource from player2 and then to apply a delayed effect'
            );

            // check that stolen resource maintained its ready state
            const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
            expect(stolenResourceList.length).toBe(1);
            const stolenResource = stolenResourceList[0];
            expect(stolenResource.exhausted).toBeFalse();

            // confirm that player1 can spend with it
            context.player2.passAction();
            expect(context.player1.readyResourceCount).toBe(2);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(11);
            expect(stolenResource.exhausted).toBeTrue();

            // Clone is defeated, resource goes back to owner's resource zone and stays exhausted
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.clone);

            expect(context.player1.resources.length).toBe(10);
            expect(context.player2.resources.length).toBe(10);
            expect(context.player2.exhaustedResourceCount).toBe(1);
            expect(context.player2.readyResourceCount).toBe(9);
            expect(context.player1.exhaustedResourceCount).toBe(10);
            expect(context.player1.readyResourceCount).toBe(0);

            expect(stolenResource.controller).toBe(context.player2Object);
            expect(stolenResource.exhausted).toBeTrue();
        });

        it('DJ\'s delayed effect should do nothing if the stolen resource was defeated before he leaves play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    leader: 'han-solo#audacious-smuggler',
                    hand: ['strafing-gunship'],
                    // 10 resources total
                    resources: [
                        'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            // play DJ with Smuggle and take control of an enemy resource
            context.player1.clickCard(context.djBlatantThief);
            const stolenResource = context.player1.resources.filter((resource) => resource.owner === context.player2Object)[0];
            expect(stolenResource).toBeInZone('resource', context.player1);

            // use Han's leader ability to queue a "defeat a resource" delayed effect for next action phase
            context.player2.passAction();
            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.');
            context.player1.clickCard(context.strafingGunship);
            expect(context.strafingGunship).toBeInZone('resource', context.player1);

            // at the start of the next action phase, Han's delayed effect defeats the stolen resource
            context.moveToNextActionPhase();
            expect(context.player1).toHavePrompt('Choose a resource to defeat');
            context.player1.clickCard(stolenResource);
            expect(stolenResource).toBeInZone('discard', context.player2);

            // DJ is defeated, delayed effect tries to return the already-defeated resource
            context.player1.passAction();
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.dj);

            expect(context.dj).toBeInZone('discard', context.player1);
            expect(stolenResource).toBeInZone('discard', context.player2);
            expect(context.player1.resources.length).toBe(11);
            expect(context.player2.resources.length).toBe(9);
        });

        it('does not exhaust enemy resources when they have the Smuggle keyword', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'han-solo#audacious-smuggler',
                    resources: [
                        'dj#blatant-thief',
                        'cantwell-arrestor-cruiser',
                        'single-reactor-ignition',
                        'power-from-pain',
                        'faith-in-your-friends'
                    ],
                    groundArena: [
                        'tech#source-of-insight'
                    ]
                },
                player2: {
                    resources: [
                        'atst',
                        'battlefield-marine',
                        'wampa',
                        'consular-security-force'
                    ],
                    groundArena: [
                        'tech#source-of-insight'
                    ]
                }
            });

            const { context } = contextRef;

            context.game.setRandomSeed('DJ test random seed');

            // Play DJ and use his ability to take control of an enemy resource
            context.player1.clickCard(context.djBlatantThief);

            expect(context.consularSecurityForce).toBeInZone('resource', context.player1);

            expect(context.player1.resources.length).toBe(6);
            expect(context.player1.readyResourceCount).toBe(1); // The stolen resource
            expect(context.player1.exhaustedResourceCount).toBe(5); // Cost of smuggling DJ with Tech

            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(3);
            expect(context.player2.exhaustedResourceCount).toBe(0);
        });

        it('DJ\'s delayed effect should not return the stolen card if it was played as a unit (Endless Legions)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'echo-base',
                    leader: 'grand-moff-tarkin#oversector-governor',
                    hand: ['endless-legions'],
                    // 25 resources total: 11 to smuggle DJ (7 + 4 aspect penalty) + 14 for Endless Legions
                    resources: [
                        'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    // single resource so DJ deterministically steals the unit card
                    resources: ['wampa']
                }
            });

            const { context } = contextRef;

            // play DJ with Smuggle and take control of Wampa as a resource
            context.player1.clickCard(context.djBlatantThief);
            expect(context.wampa).toBeInZone('resource', context.player1);
            expect(context.player2.resources.length).toBe(0);

            // play Endless Legions, reveal the stolen Wampa and play it for free
            context.player2.passAction();
            context.player1.clickCard(context.endlessLegions);
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();
            context.player2.clickDone();
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);

            // DJ is defeated, the delayed effect should not return Wampa since it's no longer a resource
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.dj);

            expect(context.dj).toBeInZone('discard', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.wampa.controller).toBe(context.player1Object);
            expect(context.player1.resources.length).toBe(24);
            expect(context.player2.resources.length).toBe(0);
        });

        it('DJ\'s when played ability should not trigger if he is played via Endless Legions', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'echo-base',
                    leader: 'grand-moff-tarkin#oversector-governor',
                    hand: ['endless-legions'],
                    // 14 resources total: enough for Endless Legions
                    resources: [
                        'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst'
                    ]
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            // play Endless Legions, reveal DJ and play him for free (not via Smuggle)
            context.player1.clickCard(context.endlessLegions);
            context.player1.clickCard(context.djBlatantThief);
            context.player1.clickDone();
            context.player2.clickDone();
            context.player1.clickCard(context.djBlatantThief);

            // DJ enters play but his Smuggle ability doesn't trigger: no resource is stolen
            expect(context.dj).toBeInZone('groundArena', context.player1);
            expect(context.player1.resources.length).toBe(13);
            expect(context.player2.resources.length).toBe(10);

            // DJ is defeated and no delayed effect exists to move any resource
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.dj);

            expect(context.dj).toBeInZone('discard', context.player1);
            expect(context.player1.resources.length).toBe(13);
            expect(context.player2.resources.length).toBe(10);
        });
    });
});
