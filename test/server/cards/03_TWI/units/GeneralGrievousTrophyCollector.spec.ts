describe('General Grievous, Trophy Collector', function () {
    integration(function (contextRef) {
        it('General Grievous ability should ignore aspect penalty for Lightsaber you play on him and defeat 4 units if he has 4 or more Lightsaber', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['fallen-lightsaber', 'jedi-lightsaber', 'mace-windus-lightsaber', 'lukes-lightsaber', 'ahsokas-padawan-lightsaber', 'shadowed-intentions'],
                    groundArena: ['general-grievous#trophy-collector', 'consular-security-force'],
                    leader: 'qira#i-alone-survived',
                    resources: 30,
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['restored-arc170'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukesLightsaber);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4); //2+2
            context.player2.passAction();

            context.player1.clickCard(context.shadowedIntentions);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(9); //3+2
            context.player2.passAction();

            context.player1.clickCard(context.fallenLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(12);
            context.player2.passAction();

            context.player1.clickCard(context.jediLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(15);
            context.player2.passAction();

            context.player1.clickCard(context.ahsokasPadawanLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(16);
            context.player2.passAction();

            context.player1.clickCard(context.generalGrievous);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();
            context.setDamage(context.p2Base, 0);
            context.generalGrievous.exhausted = false;

            context.player1.clickCard(context.maceWindusLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(18);
            context.player2.passAction();

            context.player1.clickCard(context.generalGrievous);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('');

        });
    });
});
