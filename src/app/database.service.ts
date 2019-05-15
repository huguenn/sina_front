import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';


export interface cupon {
  tipo:         string,
  codigo:       string,
  limite:       number,    
  sku:          string,
  fechaInicio:  string,
  fechaFin:     string,
  permanente:   boolean
}

@Injectable()
export class DatabaseService {
  private itemsCollection: AngularFirestoreDocument<any>;
  constructor(public db: AngularFirestore) {
    this.itemsCollection = this.db.collection('usuarios').doc('UaEwMaxHiLOmv95LuyKz')
   }
   dateFixed($date) {
    var year = $date.getFullYear()
    var month = $date.getMonth() + 1
    var day = $date.getDate()
    if($date){
      return $date.getFullYear() + "-" 
      + (year < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day)
    }else {
      return null
    }
  }

   getCollection = function($colecion) {
    return this.itemsCollection.collection($colecion).valueChanges()
  }
  getCollectionFull = function($colecion) {
    return this.itemsCollection.collection($colecion).snapshotChanges()
  }

  setCollection = function($colecion, item) {
    const id = this.db.createId();
    this.itemsCollection.collection($colecion).doc(id).set(item);
  }
  getDocument = function($colecion) {
    return this.itemsCollection.collection($colecion).doc("IBTtszbFknGwlKo3nWuY").valueChanges()
  }
  getDocumentUser = function() {
    return this.itemsCollection.valueChanges()
  }
  setDocumentUser = function($data){
    this.itemsCollection.update({"sliderOrder": $data})
  }
  setDocument = function($colecion, item) {
    const id = this.db.createId();
    this.itemsCollection.collection($colecion).doc("IBTtszbFknGwlKo3nWuY").update(item);
  }
}