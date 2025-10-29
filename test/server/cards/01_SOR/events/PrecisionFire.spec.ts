describe('Precision Fire', function () {
    integration(function (contextRef) {
        it('Precision Fire\'s ability should initiate an attack with saboteur and +2/+0 if unit is trooper', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['precision-fire'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['alliance-xwing']
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.precisionFire);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);

            // choose a trooper unit
            context.player1.clickCard(context.battlefieldMarine);

            // saboteur: we ignore sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5); // 3+2 (because battlefield marine is a trooper)

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.getChatLogs(2)).toEqual([
                'player1 plays Precision Fire to initiate an attack with Battlefield Marine',
                'player1 attacks player2\'s base with Battlefield Marine and uses Precision Fire to give Saboteur and to give +2/+0 to Battlefield Marine for this attack',
            ]);

            // reset
            context.readyCard(context.battlefieldMarine);
            context.setDamage(context.p2Base, 0);
            context.player1.moveCard(context.precisionFire, 'hand');
            context.player2.passAction();

            context.player1.clickCard(context.precisionFire);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);

            // do not choose a trooper unit
            context.player1.clickCard(context.allianceXwing);

            // saboteur: we ignore sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.corellianFreighter, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);
            expect(context.getChatLogs(2)).toEqual([
                'player1 plays Precision Fire to initiate an attack with Alliance X-Wing',
                'player1 attacks player2\'s base with Alliance X-Wing and uses Precision Fire to give Saboteur to Alliance X-Wing for this attack',
            ]);

            expect(context.player2).toBeActivePlayer();
            expect(context.allianceXwing.getPower()).toBe(2);
        });

        it('Precision Fire\'s ability should initiate an attack with no sabouteur if played on a blanked unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['precision-fire'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'alliance-xwing', upgrades: ['imprisoned'] }]
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.precisionFire);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);

            // do not choose a trooper unit
            context.player1.clickCard(context.allianceXwing);

            // no saboteur: we cannot ignore sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.corellianFreighter]);
            context.player1.clickCard(context.corellianFreighter);
            expect(context.corellianFreighter.damage).toBe(2);
            expect(context.getChatLogs(3)).toEqual([
                'player1 plays Precision Fire to initiate an attack with Alliance X-Wing',
                'player1 attacks Corellian Freighter with Alliance X-Wing',
                'player1\'s Alliance X-Wing is defeated by player2 due to having no remaining HP',
            ]);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
