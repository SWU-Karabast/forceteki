describe('Hunter, Outcast Sergeant', function () {
    integration(function (contextRef) {
        describe('Hunter\'s leader undeployed ability', function () {
            it('should reveal a resource and bring back to hand if it share a name with a friendly unit in play and resource the top card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'echo#restored'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: ['millennium-falcon#landos-pride', 'echo#restored', 'battlefield-marine', 'devotion', 'leia-organa#defiant-princess'],
                        deck: ['consular-security-force'],
                        leader: 'hunter#outcast-sergeant',
                    },
                    player2: {
                        resources: ['echo#restored'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    }
                });


                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');

                context.player1.clickCard(context.hunter);

                // only cards which share a name with friendly unique unit
                expect(context.player1).toBeAbleToSelectExactly([resourceFalcon, resourceEcho]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                context.player1.clickCard(resourceFalcon);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceFalcon).toBeInZone('hand');
                expect(context.consularSecurityForce).toBeInZone('resource');
            });
        });

        describe('Hunter\'s leader deployed ability', function () {
            it('should reveal a resource and bring back to hand if it share a name with a friendly unit in play and resource the top card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'echo#restored'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: ['millennium-falcon#landos-pride', 'echo#restored', 'battlefield-marine', 'devotion', 'leia-organa#defiant-princess'],
                        deck: ['consular-security-force'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true },
                    },
                    player2: {
                        resources: ['echo#restored'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    }
                });


                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');

                context.player1.clickCard(context.hunter);
                context.player1.clickCard(context.p2Base);

                // only cards which share a name with friendly unique unit
                expect(context.player1).toBeAbleToSelectExactly([resourceFalcon, resourceEcho]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                context.player1.clickCard(resourceFalcon);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceFalcon).toBeInZone('hand');
                expect(context.consularSecurityForce).toBeInZone('resource');
            });
        });
    });
});
