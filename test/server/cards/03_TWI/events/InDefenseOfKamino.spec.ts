describe('In Defense of Kamino', function () {
    integration(function (contextRef) {
        it('In Defense of Kamino\'s ability should give each friendly Republic unit Restore 2 and: "When Defeated: Create a Clone Trooper token."', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    base: { card: 'echo-base', damage: 5 },
                    hand: ['in-defense-of-kamino'],
                    groundArena: ['advanced-recon-commando', 'ryloth-militia'],
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['b2-legionnaires'],
                    spaceArena: ['gladiator-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inDefenseOfKamino);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            // Republic Arc-170 should Restore 2 damage from base and create a Clone Trooper when defeated
            context.player1.clickCard(context.republicArc170);
            context.player1.clickCard(context.gladiatorStarDestroyer);

            expect(context.republicArc170).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(3);

            let cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena', context.player1);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();

            context.player2.clickCard(context.b2Legionnaires);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(8);

            // Ryloth Militia is not a Republic unit, so it should not Restore 2 damage or create a Clone Trooper
            context.player1.clickCard(context.rylothMilitia);
            context.player1.clickCard(context.b2Legionnaires);
            expect(context.rylothMilitia).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(8);

            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena', context.player1);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
        });
    });
});