describe('Kimogila Heavy Fighter', function() {
    integration(function(contextRef) {
        describe('Kimogila Heavy\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interceptor-ace', 'kimogila-heavy-fighter'],
                        groundArena: ['snowspeeder'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'clone-trooper'],
                        spaceArena: ['restored-arc170']
                    }
                });
            });

            it('should deal 3 indirect damage and exhaust oppponent units damaged this way', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.battlefieldMarine, 1],
                    [context.restoredArc170, 1],
                    [context.cloneTrooper, 1]
                ]));

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.restoredArc170.damage).toBe(1);
                expect(context.cloneTrooper.damage).toBe(1);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.restoredArc170.exhausted).toBe(true);
                expect(context.cloneTrooper.exhausted).toBe(true); // works on token unit
            });

            it('should deal 3 indirect damages and exhaust friendly units damaged this way', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to yourself');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.snowspeeder, 1],
                    [context.allianceXwing, 1],
                    [context.lukeSkywalker, 1]
                ]));

                expect(context.snowspeeder.damage).toBe(1);
                expect(context.allianceXwing.damage).toBe(1);
                expect(context.lukeSkywalker.damage).toBe(1); // works on leader
                expect(context.snowspeeder.exhausted).toBe(true);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.lukeSkywalker.exhausted).toBe(true);
            });

            it('should deal 3 indirect damages to a base only and exhaust nothing', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3]
                ]));

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.restoredArc170.exhausted).toBe(false);
                expect(context.cloneTrooper.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 3 indirect damages and do nothing on already exhausted units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to yourself');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 1],
                    [context.allianceXwing, 2],
                ]));

                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.exhausted).toBe(true);
            });
        });
    });
});
