describe('Vonreg\'s Tie Interceptor, Ace of the First Order', () => {
    integration(function(contextRef) {
        it('Vonreg\'s Tie Interceptor\'s ability should get Overwhelm for have 4 or more power', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['academy-training'],
                    spaceArena: ['vonregs-tie-interceptor#ace-of-the-first-order']
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            expect(context.vonregsTieInterceptor.getPower()).toBe(3);

            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.vonregsTieInterceptor);

            expect(context.vonregsTieInterceptor.getPower()).toBe(5);
            expect(context.vonregsTieInterceptor.hasSomeKeyword('overwhelm')).toBe(true);

            context.player2.passAction();
            context.player1.clickCard(context.vonregsTieInterceptor);
            context.player1.clickCard(context.tielnFighter);

            expect(context.tielnFighter).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(4);
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

        // Ruling 2025-11-25: conditional modifiers are applied simultaneously when calculating a unit's
        // power; the unit never actually holds the intermediate value used during calculation. So a unit
        // does not "pass through" a power threshold (to gain a further conditional keyword) if a negative
        // modifier brings it back down at the same time.
        xit('does not gain the 6-power Raid when attacking Gold Leader brings its power back below 6', function () {
            // Vonreg's TIE at 5 base power gains Raid 1 from another effect (+1/+0 while attacking) and
            // attacks Gold Leader ("while defending, the attacker gets -1/-0"). The +1 and -1 apply
            // simultaneously, so its power is 5 — it never reaches 6, and does not gain the additional
            // Raid 1 from its own "6 or more power" conditional ability.
        });
    });
});