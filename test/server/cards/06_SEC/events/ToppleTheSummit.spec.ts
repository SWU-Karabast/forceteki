describe('Topple The Summit', function() {
    integration(function(contextRef) {
        describe('Topple The Summit\' ability', function() {
            it('should damage only damaged units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['topple-the-summit'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 2 }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 3 }],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.toppleTheSummit);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);

                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.bobaFett.damage).toBe(5);
                expect(context.wampa).toBeInZone('discard');
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.lukeSkywalker.damage).toBe(0);
            });

            it('can be played using Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        resources: ['topple-the-summit', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        spaceArena: [{ card: 'alliance-xwing', damage: 1 }],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett');
                expect(context.player1).toHavePassAbilityPrompt('Play Topple The Summit using Plot');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);

                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.bobaFett.damage).toBe(0);
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.lukeSkywalker.damage).toBe(0);
            });
        });
    });
});
