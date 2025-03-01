describe('Vonreg\'s Tie Interceptor, Ace of the First Order', () => {
    integration(function(contextRef) {
        it('Vonreg\'s Tie Interceptor\'s ability should get Overwhelm for have 4 or more power', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['snapshot-reflexes'],
                    spaceArena: ['vonregs-tie-interceptor#ace-of-the-first-order']
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            expect(context.vonregsTieInterceptor.getPower()).toBe(3);

            context.player1.clickCard(context.snaphotReflexes);
            context.player1.clickCard(context.vonregsTieInterceptor);

            expect(context.vonregsTieInterceptor.getPower()).toBe(4);
            expect(context.vonregsTieInterceptor.hasSomeKeyword('overwhelm')).toBe(true);

            context.player1.clickCard(context.tielnFighter);

            expect(context.tielnFighter).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(3);
        });

        it('Vonreg\'s Tie Interceptor\'s ability should get Raid 1 for have 6 or more power', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'vonregs-tie-interceptor#ace-of-the-first-order', upgrades: ['entrenched'] }]
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            expect(context.vonregsTieInterceptor.getPower()).toBe(6);
            expect(context.vonregsTieInterceptor.hasSomeKeyword('overwhelm')).toBe(true);
            expect(context.vonregsTieInterceptor.hasSomeKeyword('raid')).toBe(true);

            context.player1.clickCard(context.vonregsTieInterceptor);
            context.player1.clickCard(context.tielnFighter);

            expect(context.tielnFighter).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(6);
        });
    });
});