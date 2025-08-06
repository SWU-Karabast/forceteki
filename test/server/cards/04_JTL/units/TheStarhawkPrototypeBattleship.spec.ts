describe('The Starhawk, Prototype Battleship', function() {
    integration(function(contextRef) {
        describe('Starhawk\'s constant ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'captain-rex#fighting-for-his-brothers',
                        hand: [
                            'raddus#holdos-final-command',
                            'blue-leader#scarif-air-support',
                            'encouraging-leadership',
                            'hardpoint-heavy-blaster',
                            'poe-dameron#one-hell-of-a-pilot',
                            'pirate-battle-tank'
                        ],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: [{ card: 'crosshair#following-orders', exhausted: true }]
                    },
                    player2: {
                        leader: 'admiral-trench#chkchkchkchk',
                        base: 'tarkintown',
                        hand: ['wampa'],
                        spaceArena: ['fetts-firespray#pursuing-the-bounty']
                    }
                });
            });

            it('should decrease the play cost of a unit at pay time by half, rounded up', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 4;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                expect(context.player1).toBeAbleToSelect(context.raddus);
                context.player1.clickCard(context.raddus);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should decrease the play cost of an event at pay time by half, rounded up', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 2;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                expect(context.player1).toBeAbleToSelect(context.encouragingLeadership);
                context.player1.clickCard(context.encouragingLeadership);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should decrease the play cost of an upgrade at pay time by half, rounded up', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 1;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                expect(context.player1).toBeAbleToSelect(context.hardpointHeavyBlaster);
                context.player1.clickCard(context.hardpointHeavyBlaster);
                context.player1.clickCard(context.theStarhawk);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should decrease the play cost of a unit played with piloting', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 1;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                // jumps directly to the piloting vehicle target prompt because regular Poe cost can't be paid
                expect(context.player1).toBeAbleToSelect(context.poeDameron);
                context.player1.clickCard(context.poeDameron);
                context.player1.clickCard(context.theStarhawk);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should account for play cost after aspect penalties, paying the correct cost', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 4;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                // jumps directly to the piloting vehicle target prompt because regular Poe cost can't be paid
                expect(context.player1).toBeAbleToSelect(context.pirateBattleTank);
                context.player1.clickCard(context.pirateBattleTank);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should account for play cost after aspect penalties, not allowing to be played if too high', function() {
                const { context } = contextRef;

                context.player1.exhaustResources(context.player1.readyResourceCount - 3);

                expect(context.player1).not.toBeAbleToSelect(context.pirateBattleTank);
                expect(context.pirateBattleTank).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should decrease the activation cost of a leader ability', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 1;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                context.player1.clickCard(context.captainRex);
                context.player1.clickPrompt('If a friendly unit attacked this phase, create a Clone Trooper token.');
                context.player1.clickPrompt('Use it anyway');
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should decrease the activation cost of a unit ability', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 1;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                expect(context.player1).toBeAbleToSelect(context.crosshair);
                context.player1.clickCard(context.crosshair);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should not affect costs that are not ability activation costs', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(4); // 2 for (adjusted) play cost, 2 for effect payment
            });

            it('should not affect opponent\'s play card costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2.exhaustedResourceCount).toBe(4);
            });

            it('should not affect opponent\'s leader ability costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.admiralTrench);
                context.player2.clickPrompt('Deploy Admiral Trench');
                expect(context.player2.exhaustedResourceCount).toBe(3);

                context.ignoreUnresolvedActionPhasePrompts = true;
            });

            it('should not affect opponent\'s unit ability costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.fettsFirespray);
                context.player2.clickPrompt('Exhaust a non-unique unit');
                context.player2.clickPrompt('Use it anyway');
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });
        });

        describe('Starhawk\'s constant ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#galactic-ruler',
                        base: 'energy-conversion-lab',
                        hand: [
                            'arquitens-assault-cruiser',
                            'unity-of-purpose'
                        ],
                        groundArena: ['bendu#the-one-in-the-middle'],
                        spaceArena: ['the-starhawk#prototype-battleship']
                    },
                    player2: {
                        groundArena: ['del-meeko#providing-overwatch']
                    }
                });
            });

            it('should calculate its cost reduction after cost increases have been applied', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 4;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                expect(context.player1).toBeAbleToSelect(context.unityOfPurpose);
                context.player1.clickCard(context.unityOfPurpose);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });

            it('should calculate its cost reduction after other cost decreases have been applied', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 3;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                // attack with Bendu to trigger his ability
                context.player1.clickCard(context.bendu);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                expect(context.player1).toBeAbleToSelect(context.arquitensAssaultCruiser);
                context.player1.clickCard(context.arquitensAssaultCruiser);
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCountBefore + expectedResourceCost);
            });
        });

        it('Starhawk\'s constant ability should work with Smuggle', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'emperor-palpatine#galactic-ruler',
                    spaceArena: ['the-starhawk#prototype-battleship'],
                    resources: ['collections-starhopper', 'atst']
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeAbleToSelect(context.collectionsStarhopper);
            context.player1.clickCard(context.collectionsStarhopper);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Starhawk\'s constant ability should work with Exploit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'doctor-aphra#rapacious-archaeologist',
                    spaceArena: ['the-starhawk#prototype-battleship'],
                    hand: ['infiltrating-demolisher'],
                    resources: 1
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeAbleToSelect(context.infiltratingDemolisher);
            context.player1.clickCard(context.infiltratingDemolisher);
            context.player1.clickPrompt('Trigger Exploit');
            context.player1.clickCard(context.theStarhawk);
            context.player1.clickDone();

            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Starhawk\'s constant ability should work correctly with abilities that check the resource cost paid', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'emperor-palpatine#galactic-ruler',
                    spaceArena: ['the-starhawk#prototype-battleship'],
                    hand: ['osi-sobeck#warden-of-the-citadel']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.osiSobeck);
            context.player1.clickPrompt('Play without Exploit');

            // Osi ability triggers, can only target something with cost 3 or lower
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeCapturedBy(context.osiSobeck);
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        describe('Starhawk\'s constant ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'captain-rex#fighting-for-his-brothers',
                        hand: ['the-starhawk#prototype-battleship'],
                        resources: 9
                    },
                });
            });

            it('should not affect its own play cost (pay full cost when played)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.theStarhawk);
                expect(context.player1.exhaustedResourceCount).toBe(9);
            });

            it('should not affect its own play cost (cannot target for play with not enough resources)', function() {
                const { context } = contextRef;

                context.player1.exhaustResources(2);

                expect(context.player1).not.toBeAbleToSelect(context.theStarhawk);
                expect(context.theStarhawk).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        it('Starhawk\'s constant ability should work on other copies of Starhawk', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'captain-rex#fighting-for-his-brothers',
                    hand: ['the-starhawk#prototype-battleship'],
                    spaceArena: ['the-starhawk#prototype-battleship'],
                    resources: 5
                }
            });

            const { context } = contextRef;

            const starhawkInHand = context.player1.findCardByName('the-starhawk#prototype-battleship', 'hand');
            const starhawkInPlay = context.player1.findCardByName('the-starhawk#prototype-battleship', 'spaceArena');

            expect(context.player1).toBeAbleToSelect(starhawkInHand);
            context.player1.clickCard(starhawkInHand);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            context.player1.clickCard(starhawkInPlay);
        });
    });
});
