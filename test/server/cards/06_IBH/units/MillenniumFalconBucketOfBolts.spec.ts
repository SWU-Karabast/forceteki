describe('Millennium Falcon - Bucket Of Bolts', function () {
    integration(function (contextRef) {
        describe('Millennium Falcon\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#bucket-of-bolts'],
                        base: { damage: 0 }
                    },
                    player2: {
                        base: { damage: 0 }
                    }
                });
            });

            it('should not ready the unit when played if your base does not have more damage', function () {
                const { context } = contextRef;
                
                context.player1.clickCard(context.millenniumFalconBucketOfBolts);
                context.player1.clickPrompt('Play this card');
                
                // Verify the unit is exhausted (not readied) after being played
                expect(context.millenniumFalconBucketOfBolts.exhausted).toBe(true);
            });
            
            it('should ready the unit when played if your base has more damage', function () {
                const { context } = contextRef;
                
                // Set up damage on bases
                context.p1Base.damage = 3;
                context.p2Base.damage = 1;
                
                context.player1.clickCard(context.millenniumFalconBucketOfBolts);
                context.player1.clickPrompt('Play this card');
                
                // Verify the unit is readied after being played
                expect(context.millenniumFalconBucketOfBolts.exhausted).toBe(false);
            });
            
            it('should not ready the unit when played if bases have equal damage', function () {
                const { context } = contextRef;
                
                // Set up equal damage on bases
                context.p1Base.damage = 2;
                context.p2Base.damage = 2;
                
                context.player1.clickCard(context.millenniumFalconBucketOfBolts);
                context.player1.clickPrompt('Play this card');
                
                // Verify the unit is exhausted (not readied) after being played
                expect(context.millenniumFalconBucketOfBolts.exhausted).toBe(true);
            });
        });
    });
});