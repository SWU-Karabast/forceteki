// describe('Leader cards', function() {
//     integration(function() {
//         describe('Leaders', function() {
//             beforeEach(function () {
//                 this.setupTest({
//                     phase: 'action',
//                     player1: {
//                         groundArena: [{ card: 'wampa', damage: 1 }, 'battlefield-marine'],
//                         spaceArena: [{ card: 'cartel-spacer', damage: 1 }],
//                         leader: 'director-krennic#aspiring-to-authority'
//                     },
//                     player2: {
//                         groundArena: [{ card: 'consular-security-force', damage: 1 }],
//                     }
//                 });

//                 this.krennic = this.player1.findCardByName('director-krennic#aspiring-to-authority');
//                 this.marine = this.player1.findCardByName('battlefield-marine');
//                 this.wampa = this.player1.findCardByName('wampa');
//                 this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
//                 this.securityForce = this.player2.findCardByName('consular-security-force');

//                 this.p1Base = this.player1.base;
//                 this.p2Base = this.player2.base;
//             });

//             it('should give friendly damaged units +1/+0', function () {
//                 expect(this.wampa.power).toBe(5);
//                 expect(this.wampa.hp).toBe(5);

//                 expect(this.marine.power).toBe(3);
//                 expect(this.marine.hp).toBe(3);

//                 expect(this.cartelSpacer.power).toBe(3);
//                 expect(this.cartelSpacer.hp).toBe(3);

//                 expect(this.securityForce.power).toBe(3);
//                 expect(this.securityForce.hp).toBe(7);

//                 // do an attack to ensure the ability is being applied correctly in combat
//                 this.player1.clickCard(this.wampa);
//                 this.player1.clickCard(this.securityForce);

//                 expect(this.wampa.damage).toBe(4);
//                 expect(this.securityForce.damage).toBe(6);
//             });

//             it('should deploy and the persistent effect should work', function () {
//                 this.player1.clickCard(this.krennic);
//                 expect(this.krennic).toBeInLocation('ground arena');
//                 expect(this.krennic).not.toBeInLocation('base');

//                 expect(this.wampa.power).toBe(5);
//                 expect(this.wampa.hp).toBe(5);

//                 expect(this.marine.power).toBe(3);
//                 expect(this.marine.hp).toBe(3);

//                 expect(this.cartelSpacer.power).toBe(3);
//                 expect(this.cartelSpacer.hp).toBe(3);

//                 expect(this.securityForce.power).toBe(3);
//                 expect(this.securityForce.hp).toBe(7);

//                 // do an attack to ensure the ability is being applied correctly in combat
//                 this.player2.passAction();
//                 this.player1.clickCard(this.wampa);
//                 this.player1.clickCard(this.securityForce);

//                 expect(this.wampa.damage).toBe(4);
//                 expect(this.securityForce.damage).toBe(6);
//             });

//             it('should deploy and have restore 2', function () {
//                 this.p1Base.damage = 5;
//                 this.player1.clickCard(this.krennic);
//                 expect(this.krennic).toBeInLocation('ground arena');
//                 expect(this.krennic).not.toBeInLocation('base');

//                 // do an attack to ensure the ability is being applied correctly in combat
//                 this.player2.passAction();
//                 this.player1.clickCard(this.krennic);
//                 this.player1.clickCard(this.player2.base);

//                 expect(this.p1Base.damage).toBe(3);
//                 expect(this.p2Base.damage).toBe(2);
//             });
//         });
//     });
// });
