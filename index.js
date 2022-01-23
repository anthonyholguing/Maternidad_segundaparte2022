const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

//https://firebase.google.com/docs/functions/write-firebase-functions
exports.onUserCreate = functions.firestore.document('translado_a_salamaternidad/{translado_a_salamaternidadId}').onCreate(async (snap, context) => {
  const values = snap.data();
  var diasemana=obtenersemana(values.fechaingreso_mater);
  try {
    db.collection("translado_a_salamaternidad").doc(snap.id).update({
      dia_semana:  diasemana
   });
  } catch (error) {
    console.log(error);
  }
  //Consulta los dias de la semana 
  const query = db.collection("translado_a_salamaternidad");
  const snapshot = await query.where("dia_semana", "==", diasemana).get();
  const total = snapshot.size;
  console.log("total:"+ total);
  try {
    if (total> 3) { //--Los tres puestos por semana de la sala ya estan ocupados
       const res = await db.collection("translado_a_salamaternidad").doc(snap.id).delete();
       console.log('La sala no se puede ocupar por que ya esta ocupada por el máximo permitido') ;
      } 
  } catch (error) {
    console.log(error);
  }
});
function obtenersemana(fecha){
  var año = fecha.substring(0, 4);
  var mes = (parseInt(fecha.substring(5, 7))-1);
  var dia = fecha.substring(8, 10);
  var fechanueva = new Date(año, mes, dia);
  //obtener dia de la semana
  var oneJan = new Date(fechanueva.getFullYear(),0,1);
  var numberOfDays = Math.floor((fechanueva - oneJan) / (24 * 60 * 60 * 1000));
  var result = Math.ceil(( fechanueva.getDay() + 1 + numberOfDays) / 7);
  return result;
}