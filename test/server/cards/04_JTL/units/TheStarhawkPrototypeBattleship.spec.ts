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
                            'hardpoint-heavy-blaster'
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

            it('should decrease the activation cost of a leader ability', function() {
                const { context } = contextRef;

                // exhaust resources down to the expected amount to confirm that cost evaluation before play works and the card shows as selectable
                const expectedResourceCost = 1;
                context.player1.exhaustResources(context.player1.readyResourceCount - expectedResourceCost);
                const exhaustedResourceCountBefore = context.player1.exhaustedResourceCount;

                context.player1.clickCard(context.captainRex);
                context.player1.clickPrompt('If a friendly unit attacked this phase, create a Clone Trooper token.');
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
                context.player1.clickPrompt('Pay 2 resources');
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

                context.allowTestToEndWithOpenPrompt = true;
            });

            it('should not affect opponent\'s unit ability costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.fettsFirespray);
                context.player2.clickPrompt('Exhaust a non-unique unit');
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
    });
});
