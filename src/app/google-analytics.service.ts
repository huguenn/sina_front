import { Injectable } from '@angular/core';

declare let ga: Function;

@Injectable()
export class GoogleAnalyticsService {

  constructor() { }

  public nuevoCliente() {
    ga('send', {
      hitType: 'event',
      eventCategory: 'registro',
      eventAction: 'exitoso',
      eventLabel: 'registro'
    });
  }

  public nuevoPedido(id, total, productos) {

    ga('ecommerce:addTransaction', {
      'id': id,                         // Transaction ID. Required.
      'affiliation': 'SINA',            // Affiliation or store name.
      'revenue': total,                 // Grand Total.
      // 'shipping': '5',                   // Shipping.
      // 'tax': '1.29'                      // Tax.
    });

    for(let p of productos) {
      ga('ecommerce:addItem', {
        'id': p.id,                     // Transaction ID. Required.
        'name': p.descripcion,          // Product name. Required.
        'sku': p.sku,                   // SKU/code.
        'category': p.categoria,        // Category or variation.
        'price': p.precio,              // Unit price.
        'quantity': p.cantidad          // Quantity.
      });
    }

    ga('ecommerce:send');
  }

  public nuevaPageView (url) {

    ga('set', 'page', url);

    ga('send', 'pageview')

  }
}