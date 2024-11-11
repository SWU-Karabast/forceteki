describe('Seventh Sister', function () {
    integration(function (contextRef) {
        it('may deal 3 damage to a ground unit if attacked base', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'seventh-sister#implacable-inquisitor'],
                    hand: ['heroic-resolve'],
                },
                player2: {
                    groundArena: ['wampa', 'pyke-sentinel'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                    base: 'chopper-base'
                },
            });
            const { context } = contextRef;

            const reset = (passAction = true) => {
                context.seventhSisterImplacableInquisitor.exhausted = false;
                context.seventhSisterImplacableInquisitor.damage = 0;
                context.wampa.damage = 0;
                context.chopperBase.damage = 0;
                if (passAction) {
                    context.player2.passAction();
                }
            };

            context.player1.clickCard(context.seventhSisterImplacableInquisitor);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo, context.chopperBase]);
            context.player1.clickCard(context.chopperBase);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);

            // CASE 2: may not deal 3 damage if attacked unit
            reset();
            context.player1.clickCard(context.seventhSisterImplacableInquisitor);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo, context.chopperBase]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();

            // CASE 3: should trigger damage if damage to base is dealt by overwhelm
            reset();

            context.player1.clickCard(context.heroicResolve);
            context.player1.clickCard(context.seventhSisterImplacableInquisitor);
            context.player2.passAction();
            context.player1.clickCard(context.seventhSisterImplacableInquisitor);
            context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.wampa);
            expect(context.player2).toBeActivePlayer();
        });

        it('should trigger ability from overwhelm damage', () => {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'seventh-sister#implacable-inquisitor', upgrades: ['heroic-resolve'] }],
                },
                player2: {
                    groundArena: ['wampa', 'pyke-sentinel'],
                    base: 'chopper-base'
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.seventhSisterImplacableInquisitor);
            context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
            context.player1.clickCard(context.pykeSentinel);
            expect(context.wampa.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
