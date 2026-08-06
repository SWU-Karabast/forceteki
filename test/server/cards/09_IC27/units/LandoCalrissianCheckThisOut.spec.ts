describe('Lando Calrissian, Check This Out', function() {
    integration(function(contextRef) {
        it('Lando Calrissian\'s ability should return exactly 3 friendly resources to hand and allow resourcing up to 3 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lando-calrissian#check-this-out', 'awing'],
                    resources: ['chewbacca#faithful-first-mate', 'battlefield-marine', 'atst', 'wampa', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself'],
                    leader: 'fennec-shand#honoring-the-deal',
                    base: 'jabbas-palace'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.landoCalrissian);

            expect(context.player1).toHavePrompt('Return 3 friendly resources to their owner\'s hands. Then, you may resource up to 3 cards from your hand');
            expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.atst, context.battlefieldMarine, context.wampa, context.yoda, context.rey, context.gungi]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toHaveDisabledPromptButton('Done');

            context.player1.clickCard(context.rey);
            expect(context.player1).toHaveDisabledPromptButton('Done');
            context.player1.clickCard(context.atst);
            expect(context.player1).toHaveDisabledPromptButton('Done');
            context.player1.clickCard(context.yoda);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            context.player1.clickPrompt('Done');

            expect(context.player1).toHavePrompt('Resource up to 3 cards from your hand');
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.rey, context.atst, context.yoda]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.awing);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.atst);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.yoda);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            expect(context.rey).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('resource', context.player1);
            expect(context.atst).toBeInZone('resource', context.player1);
            expect(context.yoda).toBeInZone('resource', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Lando Calrissian\'s ability should return exactly 3 friendly resources to hand and allow resourcing 0 card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lando-calrissian#check-this-out', 'awing'],
                    resources: ['chewbacca#faithful-first-mate', 'battlefield-marine', 'atst', 'wampa', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself'],
                    leader: 'fennec-shand#honoring-the-deal',
                    base: 'jabbas-palace'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.landoCalrissian);

            context.player1.clickCard(context.rey);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.yoda);
            context.player1.clickPrompt('Done');

            context.player1.clickPrompt('Choose nothing');

            expect(context.player2).toBeActivePlayer();

            expect(context.rey).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.yoda).toBeInZone('hand', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(0);
        });

        it('Lando Calrissian\'s ability should return exactly 3 friendly resources to hand and allow resourcing 1 card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lando-calrissian#check-this-out', 'awing'],
                    resources: ['chewbacca#faithful-first-mate', 'battlefield-marine', 'atst', 'wampa', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself'],
                    leader: 'fennec-shand#honoring-the-deal',
                    base: 'jabbas-palace'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.landoCalrissian);

            context.player1.clickCard(context.rey);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.yoda);
            context.player1.clickPrompt('Done');

            context.player1.clickCard(context.awing);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            expect(context.rey).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('resource', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.yoda).toBeInZone('hand', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Lando Calrissian\'s ability should return exactly 3 friendly resources to hand and allow resourcing up to 3 cards (returning a friendly resource)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lando-calrissian#check-this-out', 'awing'],
                    spaceArena: ['arquitens-assault-cruiser'],
                    resources: ['chewbacca#faithful-first-mate', 'battlefield-marine', 'atst', 'wampa', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself'],
                    leader: 'fennec-shand#honoring-the-deal',
                    base: 'jabbas-palace'
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.landoCalrissian);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.yoda);
            context.player1.clickPrompt('Done');

            expect(context.greenSquadronAwing).toBeInZone('hand', context.player2);
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player1.clickCard(context.awing);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            expect(context.awing).toBeInZone('resource', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.yoda).toBeInZone('hand', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Lando Calrissian\'s ability should return exactly 3 friendly resources to hand (or less if there are less than 3 friendly resources) and allow resourcing up to 3 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lando-calrissian#check-this-out', 'awing'],
                    groundArena: [{ card: 'greedo#slow-on-the-draw', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    resources: ['atst', 'wampa'],
                    leader: 'han-solo#worth-the-risk',
                    base: 'jabbas-palace'
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.landoCalrissian);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Done');

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            expect(context.awing).toBeInZone('resource', context.player1);
            expect(context.atst).toBeInZone('resource', context.player1);
            expect(context.wampa).toBeInZone('resource', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player1.resources.length).toBe(3);
        });
    });
});
