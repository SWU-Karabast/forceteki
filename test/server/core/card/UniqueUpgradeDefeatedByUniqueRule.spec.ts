// Unique upgrades whose When Played ability is "If attached unit is <name>, ...". When the controller plays a second copy onto the unit that is named and the
// uniqueness rule defeats the copy that was just played, that copy is attached to nothing while its trigger is still in the trigger window, and the trigger's
// condition used to throw on the parentCard getter. Choosing the copy that was just played is a legal click, so the engine must not throw. The condition is
// evaluated when the ability resolves ("Ruling 2025-09-29" recorded in DarthMaulsLightsaber.spec.ts: a Lightsaber that is no longer attached to a unit cannot
// satisfy "if attached unit is Darth Maul"), so the effect the text grants (the second part of each ability) does not happen; every check below is that
// the effect did not happen, with the copy having been played onto the very unit that satisfies the condition.
// (Not here: the pilots and The Darksaber, whose abilities are not conditional on the attached unit; Boba Fett and Iden Versio have their own specs.)
describe('Unique upgrades defeated by the uniqueness rule right after they were played onto the unit they name', function () {
    integration(function (contextRef) {
        const cards = [
            { upgrade: 'ahsokas-padawan-lightsaber', unit: 'ahsoka-tano#always-ready-for-trouble' },
            { upgrade: 'darth-mauls-lightsaber', unit: 'darth-maul#revenge-at-last' },
            { upgrade: 'quigon-jinns-lightsaber', unit: 'quigon-jinn#the-negotiations-will-be-short' },
            { upgrade: 'lukes-lightsaber', unit: { card: 'luke-skywalker#jedi-knight', damage: 5 } },
            { upgrade: 'vaders-lightsaber', unit: 'darth-vader#commanding-the-first-legion' },
            { upgrade: 'mace-windus-lightsaber', unit: 'mace-windu#party-crasher' },
            { upgrade: 'chewbaccas-bowcaster#handcrafted-tradition', unit: 'chewbacca#faithful-first-mate' },
            { upgrade: 'the-mandalorians-rifle', unit: 'the-mandalorian#wherever-i-go-he-goes' }
        ];

        for (const { upgrade, unit } of cards) {
            describe(`${upgrade},`, function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: [upgrade],
                            deck: ['porg'],
                            groundArena: [{ card: 'battlefield-marine', upgrades: [upgrade] }, unit]
                        },
                        player2: {
                            groundArena: [{ card: 'atst', exhausted: true }, 'wampa']
                        }
                    });

                    const { context } = contextRef;
                    const copies = context.player1.findCardsByName(upgrade);
                    context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                    context.copyInPlay = copies.find((copy) => copy.zoneName === 'groundArena');
                    const unitName = typeof unit === 'string' ? unit : unit.card;
                    context.named = context.player1.findCardByName(unitName);
                });

                it('does not throw when the copy that was just played is the one defeated, and the effect of the text does not happen', function () {
                    const { context } = contextRef;
                    const namedDamage = context.named.damage;

                    context.player1.clickCard(context.copyInHand);
                    context.player1.clickCard(context.named);

                    expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);
                    context.player1.clickCard(context.copyInHand);

                    expect(context.copyInHand).toBeInZone('discard');
                    expect(context.copyInPlay).toBeAttachedTo(context.battlefieldMarine);
                    expect(context.named.isUpgraded()).toBeFalse();

                    // no attack was granted, nothing was healed, shielded, drawn, resourced, exhausted, damaged or captured
                    expect(context.player2).toBeActivePlayer();
                    expect(context.named.exhausted).toBeFalse();
                    expect(context.named.damage).toBe(namedDamage);
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.atst).toBeInZone('groundArena');
                    expect(context.porg).toBeInZone('deck');
                    expect(context.player1.hand.length).toBe(0);
                });
            });
        }
    });
});
