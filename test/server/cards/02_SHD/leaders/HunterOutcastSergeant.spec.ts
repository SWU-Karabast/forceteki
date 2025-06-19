describe('Hunter, Outcast Sergeant', function () {
    integration(function (contextRef) {
        describe('Hunter\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            });

            it('should reveal a resource and bring back to hand if it share a name with a friendly unit in play and resource the top card', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(resourceFalcon);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceFalcon]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceFalcon.title); // confirm that there is a chat message for the card

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceFalcon).toBeInZone('hand');
                expect(context.consularSecurityForce).toBeInZone('resource');
            });

            it('does not move the card to hand if it does not share a name with a friendly unit', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Choose Leia Organa, which does not share a name with a friendly unit
                context.player1.clickCard(resourceLeia);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceLeia]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceLeia.title);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceLeia).toBeInZone('resource');
                expect(context.consularSecurityForce).toBeInZone('deck');
            });

            it('does not move the card to hand if it shares a name with a friendly non-unique unit', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Choose Battlefield Marine, which shares a name with a friendly non-unique unit
                context.player1.clickCard(resourceBattlefieldMarine);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceBattlefieldMarine]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceBattlefieldMarine.title);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceBattlefieldMarine).toBeInZone('resource');
                expect(context.consularSecurityForce).toBeInZone('deck');
            });
        });

        describe('Hunter\'s leader deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            });

            it('should reveal a resource and bring back to hand if it share a name with a friendly unit in play and resource the top card', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);
                context.player1.clickCard(context.p2Base);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(resourceFalcon);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceFalcon]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceFalcon.title); // confirm that there is a chat message for the card

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceFalcon).toBeInZone('hand');
                expect(context.consularSecurityForce).toBeInZone('resource');
            });

            it('does not move the card to hand if it does not share a name with a friendly unit', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);
                context.player1.clickCard(context.p2Base);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toHavePassAbilityButton();

                // Choose Leia Organa, which does not share a name with a friendly unit
                context.player1.clickCard(resourceLeia);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceLeia]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceLeia.title);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceLeia).toBeInZone('resource');
                expect(context.consularSecurityForce).toBeInZone('deck');
            });

            it('does not move the card to hand if it shares a name with a friendly non-unique unit', function () {
                const { context } = contextRef;
                const resourceFalcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');
                const resourceBattlefieldMarine = context.player1.findCardByName('battlefield-marine', 'resource');
                const resourceLeia = context.player1.findCardByName('leia-organa#defiant-princess', 'resource');

                context.player1.clickCard(context.hunter);
                context.player1.clickCard(context.p2Base);

                // Any resource can be revealed
                expect(context.player1).toBeAbleToSelectExactly([
                    resourceFalcon,
                    resourceEcho,
                    resourceBattlefieldMarine,
                    context.devotion,
                    resourceLeia
                ]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toHavePassAbilityButton();

                // Choose Battlefield Marine, which shares a name with a friendly non-unique unit
                context.player1.clickCard(resourceBattlefieldMarine);

                // The resource is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([resourceBattlefieldMarine]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickPrompt('Done');
                expect(context.getChatLogs(1)[0]).toContain(resourceBattlefieldMarine.title);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.hunter.exhausted).toBeTrue();
                expect(resourceBattlefieldMarine).toBeInZone('resource');
                expect(context.consularSecurityForce).toBeInZone('deck');
            });
        });
    });
});
