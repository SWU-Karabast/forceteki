// SelectCardSystem reports the effect it wrapped ("<player> uses <source> to <effect>") once the
// selection resolves. These cover which selections should and should not produce that message.
describe('Select card system messages', function() {
    integration(function(contextRef) {
        describe('A selection that was given its own name', function() {
            it('still reports its effect, even though it does not set context.target', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['turbolaser-salvo'],
                        spaceArena: ['awing'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.turbolaserSalvo);
                context.player1.clickPrompt('Ground');
                context.player1.clickCard(context.awing);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.getChatLog()).toBe('player1 uses Turbolaser Salvo to deal 1 damage to Battlefield Marine');
            });
        });

        describe('A selection whose effect is another selection', function() {
            it('reports only the inner effect, not "choose a target" for the card it picked', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overgrowth'],
                        groundArena: ['wampa'],
                        base: 'kachirho',
                        resources: 10
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.overgrowth);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const logs = context.getChatLogs(5);
                expect(logs).toContain('player1 uses Overgrowth to deal 4 damage to Battlefield Marine');
                expect(logs).not.toContain('player1 uses Overgrowth to choose a target for Wampa');
            });
        });

        describe('A selection whose effect is playing a card', function() {
            it('does not duplicate the play message for a single card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['now-there-are-two-of-them', 'wampa'],
                        groundArena: ['lurking-wampa'],
                        resources: 10
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nowThereAreTwoOfThem);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.getChatLog()).toBe('player1 plays Wampa');
                expect(context.getChatLogs(5)).not.toContain('player1 uses Now There Are Two of Them to play Wampa from their hand');
            });

            it('does not duplicate the play message when playing several cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#separatist-warlord',
                        resources: 4,
                        hand: ['imperial-dark-trooper', 'confederate-courier']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.imperialDarkTrooper);
                context.player1.clickCard(context.confederateCourier);

                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses General Grievous, exhausting General Grievous to play multiple cards from their hand',
                    'player1 plays Imperial Dark Trooper',
                    'player1 plays Confederate Courier'
                ]);
            });
        });
    });
});
