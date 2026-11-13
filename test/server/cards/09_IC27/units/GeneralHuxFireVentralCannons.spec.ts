describe('General Hux, Fire Ventral Cannons!', function () {
    integration(function (contextRef) {
        it('General Hux\'s ability should give +1/+0 and Overwhelm to each other friendly First Order unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-hux#fire-ventral-cannons', 'indoctrinated-conscript', 'cell-block-guard'],
                },
                player2: {
                    groundArena: [{ card: 'supreme-council-aide', damage: 1 }],
                }
            });

            const { context } = contextRef;

            // Indoctrinated Conscript gets +1/+0, Hux and non-First Order units do not
            expect(context.indoctrinatedConscript.getPower()).toBe(2);
            expect(context.indoctrinatedConscript.getHp()).toBe(2);
            expect(context.generalHux.getPower()).toBe(3);
            expect(context.cellBlockGuard.getPower()).toBe(3);

            // The enemy First Order unit does not get +1/+0
            expect(context.supremeCouncilAide.getPower()).toBe(2);
            expect(context.supremeCouncilAide.getHp()).toBe(2);

            // Indoctrinated Conscript has Overwhelm: its 2 damage defeats the damaged enemy and 1 damage spills to the base
            context.player1.clickCard(context.indoctrinatedConscript);
            context.player1.clickCard(context.supremeCouncilAide);

            expect(context.supremeCouncilAide).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(1);
        });

        it('General Hux\'s ability should not buff enemy First Order units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-hux#fire-ventral-cannons'],
                },
                player2: {
                    groundArena: ['first-order-stormtrooper'],
                }
            });

            const { context } = contextRef;

            expect(context.firstOrderStormtrooper.getPower()).toBe(2);
            expect(context.firstOrderStormtrooper.getHp()).toBe(1);
        });
    });
});
